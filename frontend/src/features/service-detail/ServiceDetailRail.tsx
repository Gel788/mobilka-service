import { useEffect, useRef, useState } from "react";
import type { AccessoryPriceRow, RepairPriceRow, ServiceSearchItem } from "../../shared/api";
import { formatPriceRub } from "../../shared/format";
import { REPAIR_TYPE_LABELS } from "../../shared/repairLabels";

type TabId = "repairs" | "accessories";

type Props = {
  service: ServiceSearchItem | null;
  repairs: RepairPriceRow[];
  accessories: AccessoryPriceRow[];
  loading: boolean;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  highlightBrand: string;
  highlightRepairType: string;
  onMyWay: () => void;
  toast: string | null;
  /** Полноэкранный режим на телефоне (отступы safe-area, скролл). */
  sheet?: boolean;
};

export function ServiceDetailRail({
  service,
  repairs,
  accessories,
  loading,
  tab,
  onTabChange,
  highlightBrand,
  highlightRepairType,
  onMyWay,
  toast,
  sheet = false
}: Props) {
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  useEffect(() => {
    setCopyHint(null);
  }, [service?.id]);

  useEffect(() => {
    if (loading || tab !== "repairs") return;
    const root = tableWrapRef.current;
    if (!root) return;
    const row = root.querySelector(".priceRowHighlight");
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [loading, tab, repairs, highlightBrand, highlightRepairType]);

  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopyHint("Скопировано в буфер");
      window.setTimeout(() => setCopyHint(null), 2200);
    } catch {
      window.prompt("Скопируйте номер", phone);
    }
  }

  const railClass = sheet ? "detailRail detailRailSheet" : "detailRail";

  if (!service) {
    return (
      <aside className={`${railClass} detailRailEmpty`}>
        <p className="detailEmptyTitle">Выберите сервис</p>
        <p className="detailEmptyText">Нажмите на маркер или строку в списке слева — здесь появится карточка с адресом, прайсом и действиями.</p>
      </aside>
    );
  }

  const phone = service.phones[0] ?? "";

  return (
    <aside className={railClass}>
      <div className="detailRailHeader">
        <div>
          <h2 className="detailRailTitle">{service.name}</h2>
          <div className="detailRailMeta">
            <span className="detailRailRating">★ {service.rating}</span>
            <span className="detailRailDot">·</span>
            <span>{service.distanceKm} км от точки поиска</span>
          </div>
        </div>
        <div className="detailRailBadges">
          {service.verified ? <span className="pill pillOk">Проверен</span> : null}
          {service.expressRepair ? <span className="pill pillInfo">Экспресс</span> : null}
        </div>
      </div>

      <p className="detailRailLead">По вашему фильтру от {formatPriceRub(service.bestPrice)} · ориентир {service.etaMinutes} мин</p>

      <p className="detailRailAddress">{service.address}</p>
      <p className="detailRailDesc">{service.description}</p>
      <p className="detailRailHours">График: {service.openingHours}</p>

      {phone ? (
        <div className="phoneRow">
          <a className="phoneLink" href={`tel:${phone}`}>
            {phone}
          </a>
          <button type="button" className="btnMini" onClick={() => copyPhone(phone)}>
            Копировать
          </button>
          {copyHint ? <span className="copyHint">{copyHint}</span> : null}
        </div>
      ) : null}

      <div className="detailTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "repairs"}
          className={tab === "repairs" ? "detailTab detailTabActive" : "detailTab"}
          onClick={() => onTabChange("repairs")}
        >
          Ремонт
          <span className="detailTabCount">{repairs.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "accessories"}
          className={tab === "accessories" ? "detailTab detailTabActive" : "detailTab"}
          onClick={() => onTabChange("accessories")}
        >
          Аксессуары
          <span className="detailTabCount">{accessories.length}</span>
        </button>
      </div>

      <div ref={tableWrapRef} className="detailTableWrap" role="tabpanel">
        {loading ? (
          <div className="detailSkeleton" aria-busy="true">
            <div className="skLine" />
            <div className="skLine" />
            <div className="skLine skShort" />
          </div>
        ) : tab === "repairs" ? (
          repairs.length === 0 ? (
            <p className="tableEmpty">Нет позиций ремонта в прайсе для этого сервиса.</p>
          ) : (
            <table className="priceTable">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Бренд</th>
                  <th>Срок</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((row, idx) => {
                  const isMatch = row.brand === highlightBrand && row.repairType === highlightRepairType;
                  return (
                    <tr key={`${row.repairType}-${row.brand}-${idx}`} className={isMatch ? "priceRowHighlight" : undefined}>
                      <td>{REPAIR_TYPE_LABELS[row.repairType] ?? row.repairType}</td>
                      <td>{row.brand}</td>
                      <td>{row.etaMinutes} мин</td>
                      <td className="priceCell">{formatPriceRub(row.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : accessories.length === 0 ? (
          <p className="tableEmpty">Аксессуары для этого сервиса пока не заведены.</p>
        ) : (
          <table className="priceTable">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категория</th>
                <th>Наличие</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>
              {accessories.map((row, idx) => (
                <tr key={`${row.productName}-${idx}`}>
                  <td>{row.productName}</td>
                  <td>{row.category}</td>
                  <td>{row.inStock ? "В наличии" : "Под заказ"}</td>
                  <td className="priceCell">{formatPriceRub(row.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast ? <p className="detailToast">{toast}</p> : null}

      <div className="detailRailActions">
        <a className="btn btnGhost" href={`tel:${phone}`}>
          Позвонить
        </a>
        <a
          className="btn btnGhost"
          href={`https://yandex.ru/maps/?rtext=~${service.lat},${service.lng}`}
          target="_blank"
          rel="noreferrer"
        >
          Маршрут
        </a>
        <button type="button" className="btn btnPrimary" onClick={onMyWay}>
          Я в пути!
        </button>
      </div>
    </aside>
  );
}
