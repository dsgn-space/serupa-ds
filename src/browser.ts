// The browser script (diki.iife.js, also shipped as bundle.js): reads React from window.React and puts
// the components on window.Diki, for plain pages without a bundler.
import * as Diki from "./index";

window.Diki = Object.assign(window.Diki || {}, {
  version: Diki.version,
  Alert: Diki.Alert,
  Badge: Diki.Badge,
  Button: Diki.Button,
  buttonClass: Diki.buttonClass,
  Card: Diki.Card,
  CardBody: Diki.CardBody,
  CardFooter: Diki.CardFooter,
  CardHeader: Diki.CardHeader,
  Checkbox: Diki.Checkbox,
  configure: Diki.configure,
  Field: Diki.Field,
  Icon: Diki.Icon,
  Input: Diki.Input,
  Loader: Diki.Loader,
  Radio: Diki.Radio,
  RadioGroup: Diki.RadioGroup,
  Select: Diki.Select,
  Switch: Diki.Switch,
  Textarea: Diki.Textarea,
  customIcons: Diki.customIcons   // names of your custom icons
});
