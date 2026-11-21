---
"serupa-ds": patch
---

Changed (Patterns): design decision. Every pattern's empty state now looks the same: an icon in its circle over the words, with no frame. Seven pages had EmptyState's dashed frame, which is for a drop zone or a slot to fill, and four had no icon. AddressBook (location), OrderHistory (receipt), ProductCompare (compare arrows), SavedItems (heart) and StoreLocator (no results) gain one; ActivityLog, AddressBook, ListDetail, Notifications, ProductCompare, SavedItems and StoreLocator lose the frame. A new test holds the patterns to it.
