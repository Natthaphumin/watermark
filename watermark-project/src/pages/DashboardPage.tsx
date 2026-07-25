import { useEffect, useState } from "react";
import { HistoryGrid } from "../components/dashboard/HistoryGrid";
import styles from "../components/dashboard/Dashboard.module.css";
import { LogoList } from "../components/dashboard/LogoList";
import { PresetList } from "../components/dashboard/PresetList";
import { apiClient } from "../lib/apiClient";
import type { HistoryItem, Logo, Preset } from "../types/watermark";

const HISTORY_PAGE_SIZE = 24;

type Tab = "presets" | "logos" | "history";

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("presets");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyHasMore, setHistoryHasMore] = useState(false);

  useEffect(() => {
    apiClient.get<{ presets: Preset[] }>("/presets").then((res) => setPresets(res.presets));
    apiClient.get<{ logos: Logo[] }>("/logos").then((res) => setLogos(res.logos));
    apiClient.get<{ items: HistoryItem[] }>("/history?page=1").then((res) => {
      setHistoryItems(res.items);
      setHistoryHasMore(res.items.length === HISTORY_PAGE_SIZE);
    });
  }, []);

  async function handleDeletePreset(id: string) {
    await apiClient.delete(`/presets/${id}`);
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDeleteLogo(id: string) {
    await apiClient.delete(`/logos/${id}`);
    setLogos((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleDeleteHistory(id: string) {
    await apiClient.delete(`/history/${id}`);
    setHistoryItems((prev) => prev.filter((h) => h.id !== id));
  }

  async function handleLoadMoreHistory() {
    const nextPage = historyPage + 1;
    const res = await apiClient.get<{ items: HistoryItem[] }>(`/history?page=${nextPage}`);
    setHistoryItems((prev) => [...prev, ...res.items]);
    setHistoryHasMore(res.items.length === HISTORY_PAGE_SIZE);
    setHistoryPage(nextPage);
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "presets" ? styles.active : ""}`}
          onClick={() => setTab("presets")}
        >
          Presets
        </button>
        <button
          className={`${styles.tab} ${tab === "logos" ? styles.active : ""}`}
          onClick={() => setTab("logos")}
        >
          Logos
        </button>
        <button
          className={`${styles.tab} ${tab === "history" ? styles.active : ""}`}
          onClick={() => setTab("history")}
        >
          History
        </button>
      </div>

      {tab === "presets" && <PresetList presets={presets} onDelete={handleDeletePreset} />}
      {tab === "logos" && <LogoList logos={logos} onDelete={handleDeleteLogo} />}
      {tab === "history" && (
        <HistoryGrid
          items={historyItems}
          onDelete={handleDeleteHistory}
          onLoadMore={handleLoadMoreHistory}
          hasMore={historyHasMore}
        />
      )}
    </div>
  );
}
