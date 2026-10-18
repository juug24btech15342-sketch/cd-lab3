const transactions = [
  { id: "TX-001", source: "Node A", destination: "Node B", status: "Finalised", duration: 2.1 },
  { id: "TX-002", source: "Node A", destination: "Node C", status: "Finalised", duration: 3.4 },
  { id: "TX-003", source: "Node B", destination: "Node C", status: "Finalised", duration: 2.8 },
  { id: "TX-004", source: "Node A", destination: "Node B", status: "Finalised", duration: 4.2 },
  { id: "TX-005", source: "Node C", destination: "Node A", status: "Finalised", duration: 3.0 },
  { id: "TX-006", source: "Node B", destination: "Node A", status: "Finalised", duration: 2.5 },
];

const searchInput = document.querySelector("#transaction-search");
const statusFilter = document.querySelector("#status-filter");
const transactionRows = document.querySelector("#transaction-rows");
const durationChart = document.querySelector("#duration-chart");
const emptyState = document.querySelector("#empty-state");
const tableCount = document.querySelector("#table-count");
const dialog = document.querySelector("#transaction-dialog");
const detail = document.querySelector("#transaction-detail");
const toast = document.querySelector("#toast");
let toastTimeout;

function getVisibleTransactions() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  return transactions.filter((transaction) => {
    const matchesQuery = [transaction.id, transaction.source, transaction.destination, transaction.status]
      .some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (status === "all" || transaction.status === status);
  });
}

function renderRows(visibleTransactions) {
  transactionRows.replaceChildren();
  for (const transaction of visibleTransactions) {
    const row = document.createElement("tr");
    const durationWidth = Math.min(transaction.duration / 5 * 100, 100);
    row.innerHTML = `
      <td><span class="transaction-id"><span class="transaction-prefix">#</span>${transaction.id}</span></td>
      <td><span class="node-cell"><span class="node-mini">${transaction.source.slice(-1)}</span>${transaction.source}</span></td>
      <td><span class="node-cell"><span class="node-mini">${transaction.destination.slice(-1)}</span>${transaction.destination}</span></td>
      <td><span class="finalised-pill"><i></i>${transaction.status}</span></td>
      <td class="duration-cell"><span class="duration-track"><span class="duration-fill" style="width:${durationWidth}%"></span></span>${transaction.duration.toFixed(1)}s</td>
      <td><button class="detail-button" type="button" data-transaction-id="${transaction.id}" aria-label="View details for ${transaction.id}">Details&nbsp; →</button></td>`;
    transactionRows.append(row);
  }
}

function renderChart(visibleTransactions) {
  durationChart.replaceChildren();
  const maximum = Math.max(5, ...visibleTransactions.map(({ duration }) => duration));
  for (const transaction of visibleTransactions) {
    const row = document.createElement("button");
    row.className = "chart-row";
    row.type = "button";
    row.dataset.transactionId = transaction.id;
    row.setAttribute("aria-label", `${transaction.id}: ${transaction.duration.toFixed(1)} seconds. Open transaction details.`);
    const barWidth = `${transaction.duration / maximum * 100}%`;
    row.innerHTML = `<span class="chart-id">${transaction.id}</span><span class="chart-track"><span class="chart-bar" style="width:${barWidth}"></span></span><span class="chart-duration">${transaction.duration.toFixed(1)}s</span>`;
    durationChart.append(row);
  }
  durationChart.setAttribute("aria-label", `${visibleTransactions.length} sample transaction durations. Select a bar to view details.`);
}

function renderMetrics(visibleTransactions) {
  const count = visibleTransactions.length;
  const finalised = visibleTransactions.filter(({ status }) => status === "Finalised").length;
  const average = count === 0
    ? 0
    : visibleTransactions.reduce((total, { duration }) => total + duration, 0) / count;
  document.querySelector("#metric-count").textContent = String(count).padStart(2, "0");
  document.querySelector("#metric-finalised").innerHTML = `${count === 0 ? 0 : Math.round(finalised / count * 100)}<span class="metric-unit">%</span>`;
  document.querySelector("#metric-average").textContent = average.toFixed(1);
  document.querySelector("#chart-average").textContent = `${average.toFixed(1)}s`;
  durationChart.style.setProperty("--average-position", `${average / 5 * 100}%`);
  document.querySelector("#nav-count").textContent = String(count);
  tableCount.textContent = `Showing ${count} of ${transactions.length} sample transactions`;
}

function render() {
  const visibleTransactions = getVisibleTransactions();
  renderRows(visibleTransactions);
  renderChart(visibleTransactions);
  renderMetrics(visibleTransactions);
  emptyState.hidden = visibleTransactions.length > 0;
}

function openTransaction(transactionId) {
  const transaction = transactions.find(({ id }) => id === transactionId);
  if (!transaction) return;

  detail.innerHTML = `
    <div class="dialog-title-row"><h2 class="dialog-title" id="dialog-title">${transaction.id}</h2><span class="finalised-pill"><i></i>${transaction.status}</span></div>
    <p class="dialog-subtitle">${transaction.source} <span class="route-arrow">→</span> ${transaction.destination} · ${transaction.duration.toFixed(1)} seconds</p>
    <div class="detail-summary">
      <div><span>Source node</span><span>${transaction.source}</span></div>
      <div><span>Destination node</span><span>${transaction.destination}</span></div>
      <div><span>Recorded duration</span><span>${transaction.duration.toFixed(1)}s</span></div>
      <div><span>Record type</span><span>Illustrative sample</span></div>
    </div>
    <h3 class="detail-section-title">Transaction lifecycle <span class="sample-dot"></span></h3>
    <ol class="lifecycle">
      <li><span class="lifecycle-marker"></span><span><strong>Flow initiated</strong><small>Initiating node begins the sample transaction.</small></span></li>
      <li><span class="lifecycle-marker"></span><span><strong>Contract verified</strong><small>Proposed transaction passes contract checks.</small></span></li>
      <li><span class="lifecycle-marker"></span><span><strong>Notary checked</strong><small>Uniqueness checked by the notary service.</small></span></li>
      <li><span class="lifecycle-marker"></span><span><strong>Finality recorded</strong><small>Transaction finalised for its relevant participants.</small></span></li>
    </ol>
    <p class="dialog-disclaimer">Illustrative lifecycle only. This demo does not query Corda nodes, logs, vaults, or a notary service.</p>`;
  if (!dialog.open) dialog.showModal();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = ["transaction_id", "source_node", "destination_node", "status", "duration_seconds"];
  const rows = getVisibleTransactions().map(({ id, source, destination, status, duration }) => [
    id, source, destination, status, duration.toFixed(1),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cordascope-sample-transactions.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} illustrative sample ${rows.length === 1 ? "record" : "records"}.`);
}

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
document.querySelector("#export-csv").addEventListener("click", exportCsv);
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector("#network-info").addEventListener("click", () => {
  showToast("Node routes are illustrative and derived from the six sample records.");
});
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const detailButton = event.target.closest("[data-transaction-id]");
  if (detailButton) openTransaction(detailButton.dataset.transactionId);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !dialog.open && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && dialog.open) dialog.close();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

render();
