// src/components/Rating/labels.ts
var en = {
  ratingStars: (value, formatted = String(value)) => formatted + (value === 1 ? " star" : " stars"),
  ratingValue: (value, max, formatted = String(value), formattedMax = String(max)) => formatted + " out of " + formattedMax
};
var id = {
  ratingStars: (value, formatted = String(value).replace(".", ",")) => formatted + " bintang",
  ratingValue: (value, max, formatted = String(value).replace(".", ","), formattedMax = String(max)) => formatted + " dari " + formattedMax
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
