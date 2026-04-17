import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { ServiceDetailRail } from "./features/service-detail/ServiceDetailRail";
import { fetchPrices, fetchSearch, postOnMyWay, type PricesResponse, type ServiceSearchItem } from "./shared/api";
import { DEFAULT_MAP_CENTER, DEFAULT_SEARCH_LAT, DEFAULT_SEARCH_LNG } from "./shared/geo";
import { formatPriceRub } from "./shared/format";
import { osmStreetStyle } from "./shared/mapStyle";
import { useDebouncedValue } from "./shared/useDebouncedValue";
import { useMediaQuery } from "./shared/useMediaQuery";

const DEBOUNCE_MS = 450;
const MOBILE_QUERY = "(max-width: 900px)";

const DEFAULT_PRESET = "cheapest";
const DEFAULT_BRAND = "Apple";
const DEFAULT_REPAIR = "screen_replacement";
const DEFAULT_MAX_PRICE = "20000";
const DEFAULT_RADIUS = "50";

function App() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker[]>([]);
  const listRef = useRef<HTMLUListElement | null>(null);

  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [detailReturnTab, setDetailReturnTab] = useState<"list" | "map">("list");

  const [searchLat, setSearchLat] = useState(DEFAULT_SEARCH_LAT);
  const [searchLng, setSearchLng] = useState(DEFAULT_SEARCH_LNG);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [repairType, setRepairType] = useState(DEFAULT_REPAIR);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);
  const [expressOnly, setExpressOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const debouncedMaxPrice = useDebouncedValue(maxPrice, DEBOUNCE_MS);
  const debouncedRadius = useDebouncedValue(radiusKm, DEBOUNCE_MS);
  const priceRadiusPending = maxPrice !== debouncedMaxPrice || radiusKm !== debouncedRadius;

  const [items, setItems] = useState<ServiceSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceTab, setPriceTab] = useState<"repairs" | "accessories">("repairs");
  const [toast, setToast] = useState<string | null>(null);

  const active = useMemo(() => items.find((item) => item.id === activeId) ?? null, [activeId, items]);

  useEffect(() => {
    if (!isMobile) setMobileSheetOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileSheetOpen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const id = window.requestAnimationFrame(() => map.resize());
    return () => window.cancelAnimationFrame(id);
  }, [isMobile, mobileTab, mobileSheetOpen]);

  useEffect(() => {
    setPriceTab("repairs");
  }, [activeId]);

  useEffect(() => {
    if (!activeId || !listRef.current) return;
    if (isMobile && mobileSheetOpen) return;
    const node = listRef.current.querySelector<HTMLElement>(`[data-service-id="${activeId}"]`);
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId, items, isMobile, mobileSheetOpen]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: osmStreetStyle,
      center: DEFAULT_MAP_CENTER,
      zoom: 10.5
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setSearchLoading(true);
      setSearchError(null);
      const params = new URLSearchParams({
        lat: String(searchLat),
        lng: String(searchLng),
        brand,
        repairType,
        preset
      });

      const maxNum = parseOptionalPositiveInt(debouncedMaxPrice);
      const radiusNum = parseOptionalPositiveInt(debouncedRadius);
      if (maxNum !== undefined) params.set("maxPrice", String(maxNum));
      if (radiusNum !== undefined) params.set("radiusKm", String(radiusNum));
      if (expressOnly) params.set("expressRepair", "true");
      if (verifiedOnly) params.set("verifiedOnly", "true");

      try {
        const data = await fetchSearch(params);
        if (cancelled) return;
        setItems(data.items);
        setFallbackUsed(Boolean(data.fallbackUsed));
        setActiveId((prev) => {
          if (data.items.length === 0) return null;
          if (prev && data.items.some((i) => i.id === prev)) return prev;
          return data.items[0].id;
        });
      } catch {
        if (!cancelled) {
          setItems([]);
          setFallbackUsed(false);
          setSearchError("Не удалось загрузить список. Проверьте, что backend запущен.");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [brand, debouncedMaxPrice, debouncedRadius, expressOnly, preset, repairType, searchLat, searchLng, verifiedOnly]);

  useEffect(() => {
    if (!activeId) {
      setPrices(null);
      return;
    }
    let cancelled = false;
    setPricesLoading(true);
    fetchPrices(activeId)
      .then((data) => {
        if (!cancelled) setPrices(data);
      })
      .catch(() => {
        if (!cancelled) setPrices({ repairs: [], accessories: [] });
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!mapRef.current) return;
    markerRef.current.forEach((m) => m.remove());
    markerRef.current = items.map((item) => {
      const isActive = item.id === activeId;
      const el = document.createElement("button");
      el.type = "button";
      el.className = isActive ? "mapPin mapPinActive" : "mapPin";
      el.setAttribute("aria-label", item.name);
      el.setAttribute("aria-pressed", isActive ? "true" : "false");
      el.innerHTML = `<span class="mapPinDot"></span>`;
      el.addEventListener("click", () => {
        setActiveId(item.id);
        if (isMobileRef.current) {
          setDetailReturnTab("map");
          setMobileSheetOpen(true);
        }
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([item.lng, item.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 18, className: "mapPopup" }).setHTML(
            `<div class="popupInner"><strong>${escapeHtml(item.name)}</strong><p class="popupAddr">${escapeHtml(item.address)}</p><p class="popupPrice">от ${escapeHtml(formatPriceRub(item.bestPrice))}</p><p class="popupHint">Нажмите пин — выбор; на телефоне откроется карточка</p></div>`
          )
        )
        .addTo(mapRef.current!);
      return marker;
    });
  }, [items, activeId]);

  const panLng = active?.lng;
  const panLat = active?.lat;
  useEffect(() => {
    if (!mapRef.current || activeId == null || panLng == null || panLat == null) return;
    mapRef.current.easeTo({
      center: [panLng, panLat],
      zoom: Math.max(mapRef.current.getZoom(), 12),
      duration: 550
    });
  }, [activeId, panLng, panLat]);

  const locateMe = useCallback(() => {
    setGeoStatus(null);
    if (!navigator.geolocation) {
      setGeoStatus("Геолокация недоступна в браузере");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSearchLat(lat);
        setSearchLng(lng);
        setGeoStatus("Точка поиска: вы здесь");
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 12 });
      },
      () => setGeoStatus("Не удалось получить координаты — разрешите доступ"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const resetSearchPoint = useCallback(() => {
    setSearchLat(DEFAULT_SEARCH_LAT);
    setSearchLng(DEFAULT_SEARCH_LNG);
    setGeoStatus("Точка поиска: центр Москвы");
    mapRef.current?.flyTo({ center: DEFAULT_MAP_CENTER, zoom: 10.5 });
  }, []);

  const resetFilters = useCallback(() => {
    setPreset(DEFAULT_PRESET);
    setBrand(DEFAULT_BRAND);
    setRepairType(DEFAULT_REPAIR);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setRadiusKm(DEFAULT_RADIUS);
    setExpressOnly(false);
    setVerifiedOnly(false);
  }, []);

  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false);
    setMobileTab(detailReturnTab);
  }, [detailReturnTab]);

  useEffect(() => {
    if (!isMobile || !mobileSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, mobileSheetOpen, closeMobileSheet]);

  const onSelectServiceFromList = useCallback((id: string) => {
    setActiveId(id);
    if (isMobileRef.current) {
      setDetailReturnTab("list");
      setMobileSheetOpen(true);
    }
  }, []);

  async function handleOnMyWay() {
    if (!active) return;
    try {
      await postOnMyWay(active.id);
      setToast("Сервис увидел: вы в пути. Ждём вас.");
      window.setTimeout(() => setToast(null), 5000);
    } catch {
      setToast("Ошибка отправки. Попробуйте ещё раз.");
      window.setTimeout(() => setToast(null), 4000);
    }
  }

  const detailRail = (
    <ServiceDetailRail
      service={active}
      repairs={prices?.repairs ?? []}
      accessories={prices?.accessories ?? []}
      loading={pricesLoading}
      tab={priceTab}
      onTabChange={setPriceTab}
      highlightBrand={brand}
      highlightRepairType={repairType}
      onMyWay={handleOnMyWay}
      toast={toast}
      sheet={isMobile && mobileSheetOpen}
    />
  );

  const panelInner = (
    <>
      <header className="brand">
        <div className="brandMark" aria-hidden />
        <div>
          <p className="brandEyebrow">Mobilka</p>
          <h1 className="brandTitle">Сервисы рядом</h1>
          <p className="brandSub">Москва и МО · карта и прайс в одном окне</p>
        </div>
      </header>

      <div className="filtersToolbar">
        <button type="button" className="linkBtn" onClick={resetFilters}>
          Сбросить фильтры
        </button>
        <button type="button" className="linkBtn" onClick={resetSearchPoint}>
          Центр Москвы
        </button>
      </div>

      <div className="filtersCard">
        <p className="filtersLabel">Как ищем</p>
        <div className="filtersRow">
          <select className="input" value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Пресет поиска">
            <option value="cheapest">Самый дешёвый</option>
            <option value="nearest">Ближайший</option>
            <option value="fastest">Быстрее всего</option>
            <option value="verified">Проверенные</option>
          </select>
        </div>
        <p className="filtersLabel">Устройство и поломка</p>
        <div className="filtersGrid">
          <select className="input" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Бренд">
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Xiaomi">Xiaomi</option>
          </select>
          <select className="input" value={repairType} onChange={(e) => setRepairType(e.target.value)} aria-label="Тип ремонта">
            <option value="screen_replacement">Замена экрана</option>
            <option value="battery_replacement">Замена батареи</option>
            <option value="camera_repair">Ремонт камеры</option>
            <option value="charging_port">Разъём зарядки</option>
            <option value="water_damage">После влаги</option>
          </select>
          <input
            className="input"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Макс. цена, ₽"
            inputMode="numeric"
            aria-label="Максимальная цена"
          />
          <input
            className="input"
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            placeholder="Радиус, км"
            inputMode="numeric"
            aria-label="Радиус поиска в километрах"
          />
        </div>
        <div className="filterChecks">
          <label className="checkLabel">
            <input type="checkbox" checked={expressOnly} onChange={(e) => setExpressOnly(e.target.checked)} />
            <span>Только экспресс</span>
          </label>
          <label className="checkLabel">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            <span>Только проверенные</span>
          </label>
        </div>
        {priceRadiusPending ? <p className="filtersPending">Подождите — применим цену и радиус через секунду…</p> : null}
        <p className="filtersHint">Точка поиска: {searchLat.toFixed(4)}, {searchLng.toFixed(4)} · на карте «Я здесь»</p>
      </div>

      <div className="listBlock" aria-busy={searchLoading}>
        <p className="listHeading">
          <span>Результаты</span>
          {!searchLoading ? <span className="listCount">{items.length}</span> : null}
        </p>
        <div className="srOnly" aria-live="polite" aria-atomic="true">
          {searchLoading ? "Загрузка списка сервисов" : `Найдено сервисов: ${items.length}`}
        </div>
        {fallbackUsed ? (
          <div className="fallbackBanner" role="status">
            По строгим фильтрам пусто — показали ближайшие варианты <strong>без лимита цены и радиуса</strong>. Увеличьте бюджет или радиус, чтобы совпадало с фильтром.
          </div>
        ) : null}
        {searchError ? <p className="inlineError">{searchError}</p> : null}
        <div className="listWrap">
          {searchLoading ? <div className="listLoadingOverlay" aria-hidden /> : null}
          <ul ref={listRef} className={`serviceList ${searchLoading ? "serviceListDimmed" : ""}`}>
            {!searchLoading && items.length === 0 ? (
              <li className="emptyList">Ничего не нашли — сбросьте фильтры, увеличьте радиус или снимите «только экспресс / проверенные».</li>
            ) : null}
            {items.map((item) => (
              <li
                key={item.id}
                data-service-id={item.id}
                className={active?.id === item.id ? "service serviceActive" : "service"}
                onClick={() => onSelectServiceFromList(item.id)}
                role="button"
                tabIndex={0}
                aria-current={active?.id === item.id ? "true" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectServiceFromList(item.id);
                  }
                }}
              >
                <div className="serviceTop">
                  <div className="serviceNameRow">
                    <strong className="serviceName">{item.name}</strong>
                    <div className="chips">
                      {item.verified ? <span className="chip chipVerified">Проверен</span> : null}
                      {item.expressRepair ? <span className="chip chipExpress">Экспресс</span> : null}
                    </div>
                  </div>
                  <span className="serviceDist">{item.distanceKm} км</span>
                </div>
                <div className="serviceMeta">
                  <span className="priceTag">от {formatPriceRub(item.bestPrice)}</span>
                  <span className="metaSep">·</span>
                  <span>{item.etaMinutes} мин</span>
                  <span className="metaSep">·</span>
                  <span>★ {item.rating}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );

  const mapSection = (
    <section className="mapArea">
      <div className="mapToolbar">
        <span className="mapToolbarTitle">Карта</span>
        <div className="mapToolbarActions">
          {geoStatus ? <span className="mapToolbarHint">{geoStatus}</span> : null}
          <button type="button" className="toolbarBtn" onClick={locateMe}>
            Я здесь
          </button>
        </div>
      </div>
      <div ref={mapContainerRef} className="map" />
    </section>
  );

  if (isMobile) {
    return (
      <div className="appShell" data-layout="mobile">
        {!mobileSheetOpen ? (
          <div className="mobileStage">
            <div className="mobileTabPanels">
              <div
                className={`mobilePane mobilePaneList ${mobileTab === "list" ? "mobilePaneActive" : ""}`}
                aria-hidden={mobileTab !== "list"}
              >
                <aside className="panel mobilePanel">{panelInner}</aside>
              </div>
              <div
                className={`mobilePane mobilePaneMap ${mobileTab === "map" ? "mobilePaneActive" : ""}`}
                aria-hidden={mobileTab !== "map"}
              >
                {mapSection}
              </div>
            </div>
            <nav className="mobileBottomNav" aria-label="Режим просмотра">
              <button
                type="button"
                className={mobileTab === "list" ? "mobileNavBtn mobileNavBtnActive" : "mobileNavBtn"}
                onClick={() => setMobileTab("list")}
                aria-current={mobileTab === "list" ? "page" : undefined}
              >
                Список
              </button>
              <button
                type="button"
                className={mobileTab === "map" ? "mobileNavBtn mobileNavBtnActive" : "mobileNavBtn"}
                onClick={() => setMobileTab("map")}
                aria-current={mobileTab === "map" ? "page" : undefined}
              >
                Карта
              </button>
            </nav>
          </div>
        ) : (
          <div className="mobileSheet" role="dialog" aria-modal="true" aria-label="Карточка сервиса">
            <header className="mobileSheetHeader">
              <button type="button" className="mobileBackBtn" onClick={closeMobileSheet}>
                ← Назад
              </button>
              <span className="mobileSheetCrumb">{detailReturnTab === "list" ? "к списку" : "к карте"}</span>
            </header>
            <div className="mobileSheetBody">{detailRail}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="appShell" data-layout="desktop">
      <aside className="panel">{panelInner}</aside>
      <div className="workspace">
        {mapSection}
        {detailRail}
      </div>
    </div>
  );
}

function parseOptionalPositiveInt(raw: string): number | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default App;
