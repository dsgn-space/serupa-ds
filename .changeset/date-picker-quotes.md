---
"serupa-ds": patch
---

Fixed (labels): English labels use curly apostrophes and quotes throughout, so "Couldn’t copy" and "Couldn’t save" look the same on one page. Changed: Combobox loadFailed, CopyButton copyFailed, DatePicker inputNotAccepted (its quotes too, in English and Indonesian), Dialog discardDescription, ErrorBoundary errorDescription, FileUpload fileWrongType, fileTooMany and fileOnlyOne, OfflineBanner offline, and AuthCard doneTitle ("You’re signed in"). Blocks and patterns too: AuthCard failed, CommentThread postFailed and saveFailed, EmptyNoAccess and EmptyLoadFailed titles and EmptyNoAccess requestFailedLabel, and the words Checkout, ConsentBanner, DetailPage, ErrorPages, Onboarding, SessionTimeout and SignUp show and announce. A test that matched the old straight apostrophe needs the curly one (’).
