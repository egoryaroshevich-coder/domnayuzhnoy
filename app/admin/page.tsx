import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель",
  robots: { index: false, follow: false }
};

function supabaseConfigScript() {
  return {
    __html: `window.__SUPABASE_CONFIG__ = ${JSON.stringify({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? ""
    })};`
  };
}

export default function AdminPage() {
  return (
    <>
      <link rel="stylesheet" href="/admin/admin.css" />
      <div className="admin-page">
        <div className="admin-loading" id="admin-loading">Проверяем доступ...</div>
        <div className="admin-app" id="admin-app" hidden>
          <header className="admin-header">
            <a className="admin-brand" href="/">
              <img src="/assets/logo-dark.png" alt="" width="54" height="54" />
              <span><b>Дом на Южной</b><small>Панель владельца</small></span>
            </a>
            <div className="admin-header-actions">
              <span id="admin-user-email"></span>
              <button className="admin-secondary" id="admin-refresh" type="button">Обновить</button>
              <button className="admin-secondary" id="admin-logout" type="button">Выйти</button>
            </div>
          </header>

          <main className="admin-main">
            <section className="admin-intro">
              <div><p className="admin-eyebrow">Управление объектом</p><h1>Бронирования</h1></div>
              <div className="admin-stats" id="admin-stats"></div>
            </section>

            <div className="admin-view-bar">
              <nav className="admin-tabs" aria-label="Разделы админ-панели">
                <button className="active" type="button" data-admin-tab="bookings">Заявки</button>
                <button type="button" data-admin-tab="calendar">Календарь</button>
              </nav>
              <button className="admin-primary manual-booking-open" id="manual-booking-open" type="button">
                + Зарезервировать даты
              </button>
            </div>

            <p className="admin-notice" id="admin-notice" role="status"></p>

            <section className="admin-panel active" id="bookings-panel">
              <div className="bookings-toolbar">
                <label className="booking-search">
                  <span className="sr-only">Поиск заявок</span>
                  <input id="booking-search" type="search" placeholder="Имя, телефон или Telegram" autoComplete="off" />
                </label>
                <button className="admin-secondary export-button" id="export-csv" type="button">Экспорт CSV</button>
              </div>
              <div className="bookings-filter-row">
                <div className="status-filters" id="status-filters">
                  <button className="active" type="button" data-filter="all">Все</button>
                  <button type="button" data-filter="new">Новые</button>
                  <button type="button" data-filter="confirmed">Подтверждённые</button>
                  <button type="button" data-filter="cancelled">Отменённые</button>
                  <button type="button" data-filter="completed">Завершённые</button>
                  <button type="button" data-filter="today">Сегодня</button>
                  <button type="button" data-filter="week">Неделя</button>
                  <button type="button" data-filter="month">Месяц</button>
                </div>
              </div>
              <div className="bookings-table-wrap">
                <table className="bookings-table">
                  <thead><tr><th>Гость</th><th>Даты</th><th>Гости</th><th>Услуги</th><th>Стоимость</th><th>Комментарий</th><th>Статус</th><th>Действия</th></tr></thead>
                  <tbody id="bookings-body"></tbody>
                </table>
                <div className="admin-empty" id="bookings-empty" hidden>Заявок с таким статусом пока нет.</div>
              </div>
            </section>

            <section className="admin-panel" id="calendar-panel">
              <div className="admin-calendar-card">
                <div className="admin-calendar-toolbar">
                  <button id="admin-calendar-prev" type="button" aria-label="Предыдущий месяц">←</button>
                  <h2 id="admin-calendar-month"></h2>
                  <button id="admin-calendar-next" type="button" aria-label="Следующий месяц">→</button>
                </div>
                <div className="admin-calendar-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
                <div className="admin-calendar-grid" id="admin-calendar-grid"></div>
                <div className="admin-calendar-legend"><span><i></i>Свободно</span><span><i className="pending"></i>Ожидание</span><span><i className="booked"></i>Занято</span></div>
              </div>
              <div className="calendar-selection" id="calendar-selection">
                <p className="admin-eyebrow">Заявки на дату</p>
                <h3 id="calendar-selection-title">Выберите день в календаре</h3>
                <div id="calendar-selection-list"></div>
              </div>
            </section>
          </main>
        </div>

        <dialog className="booking-dialog" id="booking-dialog">
          <form method="dialog" id="booking-edit-form">
            <div className="dialog-head"><div><p className="admin-eyebrow">Редактирование</p><h2>Детали заявки</h2></div><button type="button" id="dialog-close" aria-label="Закрыть">×</button></div>
            <input type="hidden" id="edit-booking-id" />
            <div className="booking-detail-grid" id="booking-detail-grid"></div>
            <div className="dialog-section-title"><span>Услуги и комментарий</span></div>
            <div className="dialog-services">
              <label><input type="checkbox" name="edit-service" value="Баня" /> Баня</label>
              <label><input type="checkbox" name="edit-service" value="Купель" /> Купель</label>
              <label><input type="checkbox" name="edit-service" value="Банкет" /> Банкет</label>
              <label><input type="checkbox" name="edit-service" value="Повторная смена воды" /> Повторная смена воды</label>
              <label><input type="checkbox" name="edit-service" value="Фотосессия" /> Фотосессия</label>
              <label><input type="checkbox" name="edit-service" value="Украшение дома" /> Украшение дома</label>
              <label><input type="checkbox" name="edit-service" value="Нужна консультация" /> Нужна консультация</label>
            </div>
            <label className="dialog-comment">Комментарий
              <textarea id="edit-comment" maxLength={1000} rows={6}></textarea>
            </label>
            <p className="admin-error" id="dialog-error"></p>
            <div className="dialog-actions"><button className="admin-secondary" type="button" id="dialog-cancel">Отмена</button><button className="admin-primary" type="submit">Сохранить</button></div>
          </form>
        </dialog>

        <dialog className="booking-dialog manual-booking-dialog" id="manual-booking-dialog" aria-labelledby="manual-booking-title">
          <form method="dialog" id="manual-booking-form">
            <div className="dialog-head">
              <div><p className="admin-eyebrow">Ручная бронь</p><h2 id="manual-booking-title">Зарезервировать даты</h2></div>
              <button type="button" id="manual-booking-close" aria-label="Закрыть">×</button>
            </div>
            <p className="manual-booking-copy">Бронь сразу получит статус «Подтверждена», а выбранные ночи станут недоступны на сайте.</p>
            <div className="manual-booking-grid">
              <label className="dialog-field dialog-field-wide">Имя гостя или название брони
                <input id="manual-name" type="text" maxLength={120} required autoComplete="off" />
              </label>
              <label className="dialog-field">Заезд
                <input id="manual-check-in" type="date" required />
              </label>
              <label className="dialog-field">Выезд
                <input id="manual-check-out" type="date" required />
              </label>
              <label className="dialog-field">Телефон
                <input id="manual-phone" type="tel" maxLength={40} placeholder="Необязательно" autoComplete="tel" />
              </label>
              <label className="dialog-field">Количество гостей
                <input id="manual-guests" type="number" min="1" max="20" step="1" defaultValue="1" required />
              </label>
              <label className="dialog-field dialog-field-wide">Стоимость, BYN
                <input id="manual-total-price" type="number" min="0" step="1" defaultValue="0" required />
              </label>
            </div>
            <label className="dialog-comment">Комментарий
              <textarea id="manual-comment" maxLength={1000} rows={3} placeholder="Например, бронь по телефону или даты для владельца"></textarea>
            </label>
            <p className="admin-error manual-booking-error" id="manual-booking-error" role="alert"></p>
            <div className="dialog-actions">
              <button className="admin-secondary" type="button" id="manual-booking-cancel">Отмена</button>
              <button className="admin-primary" type="submit" id="manual-booking-submit">Зарезервировать</button>
            </div>
          </form>
        </dialog>
      </div>
      <script dangerouslySetInnerHTML={supabaseConfigScript()} />
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
      <script src="/supabase-browser.js" defer></script>
      <script src="/admin/admin.js" defer></script>
    </>
  );
}
