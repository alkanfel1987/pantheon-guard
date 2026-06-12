/**
 * pantheon-guard · i18n для скам-слоя действий — SEED
 *
 * Локализация ВИДИМОГО вывода extractActions*: метки классов, описание риска,
 * рецепты проверки предлога (PRETEXT_CHECKS). По языкам ru/en/de/fr.
 *
 * SCOPE (честно): локализованы метки/риск/рецепты — то, что возвращается в
 * pretext.recipe и показывается пользователю. Тексты `reasons` композита
 * assessActionRequest пока РУССКИЕ (внутренний объяснитель) — их i18n отдельный
 * шаг, на детекцию не влияет (логика по ключам cls/check, не по тексту).
 *
 * Ключи checks и классов — общие across языков; меняется только текст.
 */

export const ACTION_I18N = Object.freeze({
  ru: {
    classes: {
      execute:  { label: 'исполнение кода',       risk: 'заражение/захват устройства' },
      remote:   { label: 'удалённый доступ',      risk: 'полный контроль над устройством' },
      navigate: { label: 'переход и ввод данных', risk: 'кража учётных данных (фишинг)' },
      secret:   { label: 'раскрытие секрета',     risk: 'прямой захват доступа/денег' },
      transfer: { label: 'перевод ценности',      risk: 'необратимая потеря средств' },
      isolate:  { label: 'изоляция и увод',       risk: 'отрезание от внешней проверки' },
    },
    checks: {
      app_update_status:
        'проверить официальный магазин (App Store / Google Play / RuStore): существует ли ' +
        'обновление; если версия уже актуальна или обновление ставится из магазина — предлог ложен',
      account_status_official:
        'открыть официальное приложение/сайт банка вручную или позвонить по номеру с карты: ' +
        'есть ли блокировка/операция на самом деле',
      platform_order_status:
        'проверить заказ/доставку в личном кабинете площадки, не по ссылке из сообщения',
      official_site_direct:
        'открыть сайт сервиса вручную (адрес набрать самостоятельно), не по ссылке из сообщения',
      official_callback:
        'прервать контакт и перезвонить в организацию по официальному номеру (с карты/сайта)',
      official_support_ticket:
        'проверить через официальный канал поддержки: настоящая поддержка не инициирует ' +
        'удалённый доступ первой',
    },
  },
  en: {
    classes: {
      execute:  { label: 'code execution',        risk: 'device infection/takeover' },
      remote:   { label: 'remote access',         risk: 'full control over the device' },
      navigate: { label: 'navigate & enter data', risk: 'credential theft (phishing)' },
      secret:   { label: 'secret disclosure',     risk: 'direct seizure of access/money' },
      transfer: { label: 'value transfer',        risk: 'irreversible loss of funds' },
      isolate:  { label: 'isolation & lure',      risk: 'cut off from external verification' },
    },
    checks: {
      app_update_status:
        'check the official store (App Store / Google Play): does the update exist; if the ' +
        'version is already current or the update installs from the store — the pretext is false',
      account_status_official:
        'open the official bank app/site manually or call the number on your card: is there ' +
        'actually a block/operation',
      platform_order_status:
        'check the order/delivery in the platform account, not via the link in the message',
      official_site_direct:
        'open the service site manually (type the address yourself), not via the message link',
      official_callback:
        'end the contact and call the organization back on its official number (from card/site)',
      official_support_ticket:
        'verify via the official support channel: genuine support does not initiate remote access first',
    },
  },
  de: {
    classes: {
      execute:  { label: 'Code-Ausführung',          risk: 'Infektion/Übernahme des Geräts' },
      remote:   { label: 'Fernzugriff',              risk: 'volle Kontrolle über das Gerät' },
      navigate: { label: 'Link/Dateneingabe',        risk: 'Diebstahl von Zugangsdaten (Phishing)' },
      secret:   { label: 'Preisgabe von Geheimnis',  risk: 'direkte Übernahme von Zugang/Geld' },
      transfer: { label: 'Werttransfer',             risk: 'unwiderruflicher Geldverlust' },
      isolate:  { label: 'Isolation & Abwerbung',    risk: 'Abschneiden von externer Prüfung' },
    },
    checks: {
      app_update_status:
        'offiziellen Store prüfen (App Store / Google Play): existiert das Update; wenn die ' +
        'Version aktuell ist oder das Update aus dem Store kommt — Vorwand ist falsch',
      account_status_official:
        'offizielle Bank-App/Website manuell öffnen oder Nummer von der Karte anrufen: gibt es ' +
        'die Sperre/Operation wirklich',
      platform_order_status:
        'Bestellung/Lieferung im Plattform-Konto prüfen, nicht über den Link aus der Nachricht',
      official_site_direct:
        'Website des Dienstes manuell öffnen (Adresse selbst eingeben), nicht über den Nachrichten-Link',
      official_callback:
        'Kontakt beenden und die Organisation unter ihrer offiziellen Nummer zurückrufen (Karte/Website)',
      official_support_ticket:
        'über den offiziellen Support-Kanal prüfen: echter Support initiiert keinen Fernzugriff zuerst',
    },
  },
  fr: {
    classes: {
      execute:  { label: 'exécution de code',        risk: 'infection/prise de contrôle de l’appareil' },
      remote:   { label: 'accès à distance',         risk: 'contrôle total de l’appareil' },
      navigate: { label: 'lien & saisie de données', risk: 'vol d’identifiants (hameçonnage)' },
      secret:   { label: 'divulgation de secret',    risk: 'prise directe d’accès/d’argent' },
      transfer: { label: 'transfert de valeur',      risk: 'perte irréversible de fonds' },
      isolate:  { label: 'isolement & détournement', risk: 'coupure de toute vérification externe' },
    },
    checks: {
      app_update_status:
        'vérifier le store officiel (App Store / Google Play) : la mise à jour existe-t-elle ; si la ' +
        'version est déjà à jour ou s’installe depuis le store — le prétexte est faux',
      account_status_official:
        'ouvrir l’app/le site officiel de la banque manuellement ou appeler le numéro de la carte : ' +
        'le blocage/l’opération existe-t-il vraiment',
      platform_order_status:
        'vérifier la commande/livraison dans l’espace de la plateforme, pas via le lien du message',
      official_site_direct:
        'ouvrir le site du service manuellement (taper l’adresse soi-même), pas via le lien du message',
      official_callback:
        'mettre fin au contact et rappeler l’organisation sur son numéro officiel (carte/site)',
      official_support_ticket:
        'vérifier via le canal de support officiel : un vrai support n’initie pas l’accès à distance en premier',
    },
  },
});

/** Безопасный доступ: язык → ru-fallback. */
export function actionLocale(lang = 'ru') {
  return ACTION_I18N[lang] ?? ACTION_I18N.ru;
}
