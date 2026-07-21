import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Project } from '@/lib/types';
import { UploadIcon, type UploadIconHandle } from '@/components/icons/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import DateRangeSelect from '@/components/DateRangeSelect';
import { formatHours } from '@/lib/eventStats';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface InvoiceCreatorProps {
  projects: Project[];
  user: { name?: string; email?: string } | null;
  rangeLabel: string;
  rangeKey: string;
  onBack: () => void;
}

type LineEdit = { description?: string; hours?: string; rate?: string };

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF', 'SEK'] as const;

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  SEK: 'kr',
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const parseNum = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};
const hoursToInput = (h: number) => String(round2(h));

const money = (n: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    Number.isFinite(n) ? n : 0
  );

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function InvoiceCreator({
  projects,
  user,
  rangeLabel,
  rangeKey,
  onBack,
}: InvoiceCreatorProps) {
  const { toast } = useToast();
  const uploadIconRef = React.useRef<UploadIconHandle>(null);

  const suggestedRate = React.useMemo(() => {
    const withRate = projects.find((p) => typeof p.hourlyRate === 'number' && p.hourlyRate! > 0);
    return withRate?.hourlyRate ?? 100;
  }, [projects]);

  const [removedIds, setRemovedIds] = React.useState<string[]>([]);
  const [edits, setEdits] = React.useState<Record<string, LineEdit>>({});
  const [defaultRate, setDefaultRate] = React.useState<string>(String(suggestedRate));
  const [currency, setCurrency] = React.useState<string>('EUR');
  const [taxRate, setTaxRate] = React.useState<string>('0');
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const [invoiceNumber, setInvoiceNumber] = React.useState('INV-0001');
  const [issueDate, setIssueDate] = React.useState(todayISO());
  const [dueDate, setDueDate] = React.useState(addDaysISO(14));
  const [from, setFrom] = React.useState([user?.name, user?.email].filter(Boolean).join('\n'));
  const [billTo, setBillTo] = React.useState('');
  const [paymentDetails, setPaymentDetails] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Switching the time frame changes what's billable, so reset the work list.
  React.useEffect(() => {
    setRemovedIds([]);
    setEdits({});
  }, [rangeKey]);

  const selectedProjects = projects.filter((p) => !removedIds.includes(p.id));
  const availableToAdd = projects.filter((p) => removedIds.includes(p.id));

  const setEdit = (id: string, patch: LineEdit) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const removeLine = (id: string) => setRemovedIds((prev) => [...prev, id]);
  const addLine = (id: string) => setRemovedIds((prev) => prev.filter((x) => x !== id));
  const addAll = () => setRemovedIds([]);

  const numericDefaultRate = parseNum(defaultRate);

  const lines = selectedProjects.map((p) => {
    const e = edits[p.id] ?? {};
    const hoursStr = e.hours ?? hoursToInput(p.totalHours);
    const rateStr =
      e.rate ?? (typeof p.hourlyRate === 'number' ? String(p.hourlyRate) : defaultRate);
    const hours = parseNum(hoursStr);
    const rate = parseNum(rateStr);
    return {
      id: p.id,
      name: p.name,
      trackedHours: p.totalHours,
      description: e.description ?? p.name,
      hoursStr,
      rateStr,
      hours,
      rate,
      amount: round2(hours * rate),
    };
  });

  const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  const numericTax = parseNum(taxRate);
  const taxAmount = round2((subtotal * numericTax) / 100);
  const total = round2(subtotal + taxAmount);

  const hasIssues = lines.some((l) => l.hours <= 0 || l.rate <= 0);

  const handleExport = () => {
    if (lines.length === 0) {
      toast({
        title: 'Add a project first',
        description: 'Pick at least one project to include on the invoice.',
      });
      return;
    }
    if (total <= 0) {
      toast({
        title: 'Nothing to bill',
        description: 'Set hours and rates so the invoice total is above zero.',
      });
      return;
    }
    if (hasIssues) {
      toast({
        title: 'Check your line items',
        description: 'Some lines have no hours or no rate. Fix them or remove them.',
      });
      return;
    }
    const cleanup = () => {
      document.body.classList.remove('printing-invoice');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    document.body.classList.add('printing-invoice');
    window.print();
    toast({ title: 'Invoice ready', description: 'Save it as PDF from the print dialog.' });
  };

  const symbol = CURRENCY_SYMBOL[currency] ?? '';

  const printData: PrintData = {
    invoiceNumber,
    issueDate,
    dueDate,
    from,
    billTo,
    paymentDetails,
    reference: invoiceNumber,
    notes,
    currency,
    taxRate: numericTax,
    lines: lines.map((l) => ({
      id: l.id,
      description: l.description,
      hours: l.hours,
      rate: l.rate,
      amount: l.amount,
    })),
    subtotal,
    taxAmount,
    total,
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">Create invoice</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExport}
            disabled={lines.length === 0}
            onMouseEnter={() => uploadIconRef.current?.startAnimation()}
            onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
            className="gap-1.5 rounded-lg"
          >
            <UploadIcon ref={uploadIconRef} size={15} className="shrink-0" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Parties */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From">
          <textarea
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            rows={3}
            placeholder="Your name&#10;you@email.com"
            className={textareaClass}
          />
        </Field>
        <Field label="Bill to">
          <textarea
            value={billTo}
            onChange={(e) => setBillTo(e.target.value)}
            rows={3}
            placeholder="Client name&#10;Company / address"
            className={textareaClass}
          />
        </Field>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Invoice #">
          <Input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="h-9 rounded-lg"
          />
        </Field>
        <Field label="Issue date">
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="h-9 rounded-lg"
          />
        </Field>
        <Field label="Due date">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-9 rounded-lg"
          />
        </Field>
        <Field label="Currency">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-9 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c} className="rounded-lg text-sm">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Work */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium">Billable work</h3>
            <p className="text-xs text-muted-foreground">Hours pulled from your tracked time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-input px-0.5">
              <DateRangeSelect triggerClassName="h-8 text-xs" />
            </div>
            <AddProjectMenu
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              available={availableToAdd}
              onAdd={(id) => {
                addLine(id);
                setPickerOpen(false);
              }}
              onAddAll={() => {
                addAll();
                setPickerOpen(false);
              }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          {lines.length > 0 && (
            <div className={cn(ROW_GRID, 'border-b border-border/60 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground')}>
              <span className="px-2">Description</span>
              <span className="px-2">Hours</span>
              <span className="px-2">Rate</span>
              <span className="px-2 text-right">Amount</span>
              <span />
            </div>
          )}

          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <p className="text-sm font-medium">No projects on this invoice yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Add the projects you tracked during {rangeLabel.toLowerCase()} to bill them.
              </p>
              {availableToAdd.length > 0 ? (
                <div className="pt-1">
                  <AddProjectMenu
                    open={pickerOpen}
                    onOpenChange={setPickerOpen}
                    available={availableToAdd}
                    onAdd={(id) => {
                      addLine(id);
                      setPickerOpen(false);
                    }}
                    onAddAll={() => {
                      addAll();
                      setPickerOpen(false);
                    }}
                  />
                </div>
              ) : (
                <p className="pt-1 text-xs text-muted-foreground">
                  No tracked projects in this period. Try another time frame.
                </p>
              )}
            </div>
          ) : (
            lines.map((line) => (
              <div
                key={line.id}
                className={cn(ROW_GRID, 'border-b border-border/40 px-3 py-1.5 last:border-b-0')}
              >
                <Input
                  value={line.description}
                  onChange={(e) => setEdit(line.id, { description: e.target.value })}
                  className={cellInput}
                />
                <Input
                  inputMode="decimal"
                  value={line.hoursStr}
                  onChange={(e) => setEdit(line.id, { hours: e.target.value })}
                  className={cn(cellInput, 'tabular-nums', line.hours <= 0 && 'border-amber-500/70')}
                />
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {symbol}
                  </span>
                  <Input
                    inputMode="decimal"
                    value={line.rateStr}
                    onChange={(e) => setEdit(line.id, { rate: e.target.value })}
                    className={cn(cellInput, 'pl-6 tabular-nums', line.rate <= 0 && 'border-amber-500/70')}
                  />
                </div>
                <span className="px-2 text-right text-sm tabular-nums">
                  {money(line.amount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  aria-label={`Remove ${line.name}`}
                  className="flex h-7 w-7 items-center justify-center justify-self-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Settings + totals */}
        <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
          <div className="flex items-end gap-3">
            <Field label={`Default rate (${symbol}/h)`}>
              <Input
                inputMode="decimal"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
                className="h-9 w-28 rounded-lg tabular-nums"
              />
            </Field>
            <Field label="Tax %">
              <Input
                inputMode="decimal"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="h-9 w-20 rounded-lg tabular-nums"
              />
            </Field>
          </div>

          <div className="ml-auto flex w-full max-w-[16rem] flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums text-foreground">{money(subtotal, currency)}</span>
            </div>
            {numericTax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({numericTax}%)</span>
                <span className="tabular-nums text-foreground">{money(taxAmount, currency)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-border/60 pt-2 text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{money(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment + notes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment details">
          <textarea
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
            rows={3}
            placeholder="Bank name&#10;IBAN / account number&#10;BIC / SWIFT"
            className={textareaClass}
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Thank you for your business"
            className={textareaClass}
          />
        </Field>
      </div>

      <InvoicePrintable data={printData} />
    </div>
  );
}

const textareaClass =
  'w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

// Shared column template so the header, every row, and the totals line up.
const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_5rem_6.5rem_6.5rem_2rem] items-center gap-x-2';

const cellInput =
  'h-9 rounded-md border border-transparent bg-transparent px-2 text-sm shadow-none focus-visible:border-input focus-visible:ring-0 hover:border-input';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AddProjectMenu({
  open,
  onOpenChange,
  available,
  onAdd,
  onAddAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: Project[];
  onAdd: (id: string) => void;
  onAddAll: () => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2.5 text-xs [&_svg]:size-3.5"
        >
          <Plus />
          Add project
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects to add.</CommandEmpty>
            {available.length > 0 && (
              <CommandGroup>
                {available.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.name}
                    onSelect={() => onAdd(p.id)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatHours(p.totalHours)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          {available.length > 1 && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={onAddAll}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                Add all ({available.length})
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface PrintData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  from: string;
  billTo: string;
  paymentDetails: string;
  reference: string;
  notes: string;
  currency: string;
  taxRate: number;
  lines: { id: string; description: string; hours: number; rate: number; amount: number }[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

// Design-system tokens (light theme) mirrored from index.css so the exported
// PDF matches the on-screen invoice creator. Two sizes, two colors, no all-caps.
const INK = '#1a1a1a';
const MUTED = '#666666';
const LINE = '#e5e5e5';

const labelStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  marginBottom: '8px',
};

const metaRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '32px',
  padding: '2px 0',
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '5px 0',
  color: MUTED,
  fontSize: '13px',
};

const th = (align: React.CSSProperties['textAlign']): React.CSSProperties => ({
  padding: '0 0 12px',
  textAlign: align,
  fontSize: '12px',
  fontWeight: 400,
  color: MUTED,
});

const td = (align: React.CSSProperties['textAlign']): React.CSSProperties => ({
  padding: '12px 0',
  textAlign: align,
  verticalAlign: 'top',
  borderTop: `1px solid ${LINE}`,
  fontVariantNumeric: align === 'right' ? 'tabular-nums' : 'normal',
});

function InvoicePrintable({ data }: { data: PrintData }) {
  if (typeof document === 'undefined') return null;

  const hasPayment = Boolean(data.paymentDetails);

  const doc = (
    <div
      className="invoice-print-doc"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        color: INK,
        background: '#ffffff',
        lineHeight: 1.5,
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '44px',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>Invoice</div>
          <div style={{ fontSize: '13px', minWidth: '220px' }}>
            <div style={metaRow}>
              <span style={{ color: MUTED }}>Invoice no.</span>
              <span>{data.invoiceNumber || '—'}</span>
            </div>
            <div style={metaRow}>
              <span style={{ color: MUTED }}>Issued</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(data.issueDate)}</span>
            </div>
            <div style={metaRow}>
              <span style={{ color: MUTED }}>Due</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          <div>
            <div style={labelStyle}>From</div>
            <div style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{data.from || '—'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={labelStyle}>Bill to</div>
            <div style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{data.billTo || '—'}</div>
          </div>
        </div>

        {/* Line items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <colgroup>
            <col />
            <col style={{ width: '72px' }} />
            <col style={{ width: '104px' }} />
            <col style={{ width: '104px' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${INK}` }}>
              <th style={th('left')}>Description</th>
              <th style={th('right')}>Hours</th>
              <th style={th('right')}>Rate</th>
              <th style={th('right')}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l) => (
              <tr key={l.id}>
                <td style={td('left')}>{l.description}</td>
                <td style={td('right')}>{l.hours}</td>
                <td style={td('right')}>{money(l.rate, data.currency)}</td>
                <td style={{ ...td('right'), fontWeight: 500 }}>{money(l.amount, data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <div style={{ width: '260px' }}>
            <div style={totalRowStyle}>
              <span>Subtotal</span>
              <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>
                {money(data.subtotal, data.currency)}
              </span>
            </div>
            {data.taxRate > 0 && (
              <div style={totalRowStyle}>
                <span>Tax ({data.taxRate}%)</span>
                <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>
                  {money(data.taxAmount, data.currency)}
                </span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 0',
                marginTop: '6px',
                borderTop: `1px solid ${INK}`,
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              <span>Amount due</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(data.total, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        {(hasPayment || data.notes) && (
          <div
            style={{
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: `1px solid ${LINE}`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
            }}
          >
            {hasPayment && (
              <div>
                <div style={labelStyle}>Payment</div>
                {data.paymentDetails && (
                  <div style={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{data.paymentDetails}</div>
                )}
                {data.reference && (
                  <div style={{ fontSize: '13px', marginTop: data.paymentDetails ? '10px' : 0 }}>
                    <span style={{ color: MUTED }}>Reference </span>
                    {data.reference}
                  </div>
                )}
              </div>
            )}
            {data.notes && (
              <div>
                <div style={labelStyle}>Notes</div>
                <div style={{ fontSize: '13px', color: MUTED, whiteSpace: 'pre-line' }}>{data.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(doc, document.body);
}
