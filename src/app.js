const API_BASE_URL = "https://jguawzn6ka.execute-api.us-east-1.amazonaws.com";

let loadedAssets = [];
let selectedCode = null;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  verifySecureSession();
});

function verifySecureSession() {
  const token = localStorage.getItem("shrtn_token");
  const username = localStorage.getItem("shrtn_username");

  if (!token || !username) {
    alert("Acceso denegado. Por favor inicia sesión en la consola principal.");
    return;
  }

  document.getElementById("userProfileName").innerText = username;
  document.getElementById("userAvatar").innerText = username
    .substring(0, 2)
    .toUpperCase();

  fetchUserAssets();
}

async function fetchUserAssets() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = `
    <div class="text-center py-6 text-xs text-slate-400 flex flex-col gap-2 justify-center items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        Consultando DynamoDB...
    </div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
    });
    if (!response.ok) throw new Error();
    loadedAssets = await response.json();
    renderSidebarLinks();
  } catch (error) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-red-500 font-medium px-2">⚠️ Error de conexión con la API Cloud.</div>`;
  }
}

function renderSidebarLinks() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = "";

  if (!loadedAssets || loadedAssets.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400 italic px-2">No se encontraron links activos.</div>`;
    return;
  }

  loadedAssets.forEach((asset) => {
    const button = document.createElement("button");
    button.className = `sidebar-link-btn w-full text-left p-3 rounded-xl border border-transparent hover:bg-slate-50 flex items-center justify-between gap-3 text-slate-700 hover:text-slate-900 font-medium text-sm transition-all`;
    button.id = `btn-${asset.code}`;
    button.onclick = () => selectAsset(asset.code);

    button.innerHTML = `
            <div class="truncate">
                <p class="font-semibold text-slate-800 font-mono text-sm">/${asset.code}</p>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">${asset.long_url.replace(/https?:\/\//, "")}</p>
            </div>
            <div class="shrink-0 text-right">
                <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
                    ${asset.total_clicks}
                </span>
            </div>
        `;
    container.appendChild(button);
  });

  if (selectedCode) {
    const activeBtn = document.getElementById(`btn-${selectedCode}`);
    if (activeBtn) activeBtn.classList.add("active");
  }
}

async function selectAsset(code) {
  if (selectedCode) {
    const prevBtn = document.getElementById(`btn-${selectedCode}`);
    if (prevBtn) prevBtn.classList.remove("active");
  }
  selectedCode = code;

  const currentBtn = document.getElementById(`btn-${code}`);
  if (currentBtn) currentBtn.classList.add("active");

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("analyticsContent").classList.remove("hidden");

  const assetSummary = loadedAssets.find((item) => item.code === code);
  if (!assetSummary) return;

  document.getElementById("displayShortCode").innerText =
    `/${assetSummary.code}`;

  const longUrlAnchor = document.getElementById("displayLongUrl");
  longUrlAnchor.href = assetSummary.long_url;
  longUrlAnchor.innerText = assetSummary.long_url;
  document.getElementById("kpiTotalClicks").innerText =
    assetSummary.total_clicks;

  const logsContainer = document.getElementById("liveLogsContainer");
  logsContainer.innerHTML = `<div class="p-6 text-xs text-slate-400 text-center animate-pulse">Obteniendo trazas desde la nube...</div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/stats/${code}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
    });
    const detailedData = await response.json();

    logsContainer.innerHTML = "";
    if (
      !detailedData.visit_history ||
      detailedData.visit_history.length === 0
    ) {
      logsContainer.innerHTML = `
        <div class="p-6 text-slate-400 text-xs text-center italic">
            No hay eventos de redirección registrados para este link.
        </div>`;
    } else {
      [...detailedData.visit_history].reverse().forEach((timestamp) => {
        const row = document.createElement("div");
        row.className =
          "px-6 py-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-xs font-medium";
        row.innerHTML = `
                    <div class="flex items-center gap-2.5">
                        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <span class="text-slate-700 font-mono">GET_DECODE_REQUEST</span>
                    </div>
                    <span class="text-slate-400 font-mono text-[11px]">${new Date(timestamp).toLocaleString()}</span>
                `;
        logsContainer.appendChild(row);
      });
    }
  } catch (err) {
    logsContainer.innerHTML = `<div class="p-4 text-xs text-red-500 text-center">Error al sincronizar logs históricos.</div>`;
  }
}

function copyCurrentShortUrl() {
  if (!selectedCode) return;
  const targetUrl = `${API_BASE_URL}/${selectedCode}`;
  navigator.clipboard.writeText(targetUrl).then(() => {
    alert(`¡Enlace corto copiado!: ${targetUrl}`);
  });
}
