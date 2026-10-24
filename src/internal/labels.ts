// The words the components say or show on their own, in English, and the same words in Indonesian.
// SerupaProvider (internal/provider.tsx) picks between them; a component's own prop still wins.
/** The words the components say or show on their own: button names, region names, empty and loading text.
    <SerupaProvider labels> changes them for a subtree; a component's own prop (closeLabel, dismissLabel, …)
    still wins for that one instance. */
export interface SerupaLabels {
  /** Dialog and Drawer × button. */
  close: string;
  /** Alert and Toast close button. */
  dismiss: string;
  /** Loader, and Button and Badge while loading. */
  loading: string;
  /** Combobox while loading options. */
  loadingResults: string;
  /** Combobox when nothing matches. */
  noResults: string;
  /** SearchInput while loading. */
  searching: string;
  /** SearchInput clear button. */
  clearSearch: string;
  /** Before the name on a remove button: Badge ("Remove Design"), FileUpload ("Remove report.pdf"). */
  remove: string;
  /** Image view and remove buttons, and the viewer's name when the image has no alt text. */
  viewImage: string;
  removeImage: string;
  image: string;
  /** Pagination. */
  pagination: string;
  previousPage: string;
  nextPage: string;
  page: (page: number) => string;
  /** Breadcrumb, and its "…" button. */
  breadcrumb: string;
  showHiddenPages: string;
  /** Calendar month buttons. */
  previousMonth: string;
  nextMonth: string;
  /** Carousel arrows. */
  previousSlide: string;
  nextSlide: string;
  /** NumberInput step buttons. */
  decrease: string;
  increase: string;
  /** DatePicker, DateRangePicker and TimePicker. */
  chooseDate: string;
  chooseDates: string;
  chooseTime: string;
  startDate: string;
  endDate: string;
  chooseStartDate: string;
  chooseEndDate: string;
  /** Stepper: its name, and the words read out or shown for a step. */
  progress: string;
  completed: string;
  hasError: string;
  optional: string;
  /** Toaster region. */
  notifications: string;
  /** Toaster: said once, after the first toast with an action, so keyboard and screen reader users know how to reach it. */
  toastShortcut: (key: string) => string;
  /** Sidebar and Navbar nav, and the Navbar menu button. */
  mainNavigation: string;
  menu: string;
  /** FileUpload. */
  dragFiles: string;
  dragFile: string;
  chooseFiles: string;
  chooseFile: string;
  chosenFiles: string;
  chosenFile: string;
  /** PasswordInput show/hide button. */
  showPassword: string;
  /** Table's scroll region when it has no caption. */
  table: string;
}

/** The English words (the default). */
export const DEFAULT_LABELS: SerupaLabels = {
  close: "Close",
  dismiss: "Dismiss",
  loading: "Loading…",
  loadingResults: "Loading…",
  noResults: "No results",
  searching: "Searching",
  clearSearch: "Clear search",
  remove: "Remove",
  viewImage: "View image",
  removeImage: "Remove image",
  image: "Image",
  pagination: "Pagination",
  previousPage: "Previous page",
  nextPage: "Next page",
  page: (n) => "Page " + n,
  breadcrumb: "Breadcrumb",
  showHiddenPages: "Show the hidden pages",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousSlide: "Previous slide",
  nextSlide: "Next slide",
  decrease: "Decrease",
  increase: "Increase",
  chooseDate: "Choose date",
  chooseDates: "Choose dates",
  chooseTime: "Choose time",
  startDate: "Start date",
  endDate: "End date",
  chooseStartDate: "Choose the start date",
  chooseEndDate: "Choose the end date",
  progress: "Progress",
  completed: "completed",
  hasError: "has an error",
  optional: "Optional",
  notifications: "Notifications",
  toastShortcut: (key) => "Press " + key + " to reach it.",
  mainNavigation: "Main",
  menu: "Menu",
  dragFiles: "Drag files here",
  dragFile: "Drag a file here",
  chooseFiles: "Choose files",
  chooseFile: "Choose a file",
  chosenFiles: "Chosen files",
  chosenFile: "Chosen file",
  showPassword: "Show password",
  table: "Table",
};


/** The same words in Indonesian: `<SerupaProvider locale="id-ID" labels={idLabels}>`. */
export const idLabels: SerupaLabels = {
  close: "Tutup",
  dismiss: "Abaikan",
  loading: "Memuat…",
  loadingResults: "Memuat…",
  noResults: "Tidak ada hasil",
  searching: "Mencari",
  clearSearch: "Hapus pencarian",
  remove: "Hapus",
  viewImage: "Lihat gambar",
  removeImage: "Hapus gambar",
  image: "Gambar",
  pagination: "Halaman",
  previousPage: "Halaman sebelumnya",
  nextPage: "Halaman berikutnya",
  page: (n) => "Halaman " + n,
  breadcrumb: "Navigasi jejak",
  showHiddenPages: "Tampilkan halaman tersembunyi",
  previousMonth: "Bulan sebelumnya",
  nextMonth: "Bulan berikutnya",
  previousSlide: "Slide sebelumnya",
  nextSlide: "Slide berikutnya",
  decrease: "Kurangi",
  increase: "Tambah",
  chooseDate: "Pilih tanggal",
  chooseDates: "Pilih rentang tanggal",
  chooseTime: "Pilih waktu",
  startDate: "Tanggal mulai",
  endDate: "Tanggal selesai",
  chooseStartDate: "Pilih tanggal mulai",
  chooseEndDate: "Pilih tanggal selesai",
  progress: "Kemajuan",
  completed: "selesai",
  hasError: "ada kesalahan",
  optional: "Opsional",
  notifications: "Notifikasi",
  toastShortcut: (key) => "Tekan " + key + " untuk menjangkaunya.",
  mainNavigation: "Utama",
  menu: "Menu",
  dragFiles: "Seret file ke sini",
  dragFile: "Seret file ke sini",
  chooseFiles: "Pilih file",
  chooseFile: "Pilih file",
  chosenFiles: "File yang dipilih",
  chosenFile: "File yang dipilih",
  showPassword: "Tampilkan kata sandi",
  table: "Tabel",
};
