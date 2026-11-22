// Serupa 17.1.0: design tokens for native apps, generated from design-tokens/ (tools/build/native-tokens.mjs). Don't edit.

import SwiftUI

/// Sizes in points (a rem is 16), durations in seconds, opacities from 0 to 1.
public enum SerupaTokens {
    /** `0` (`p-0`, `m-0`, `gap-0`…): 0px. */
    public static let spacing0: CGFloat = 0
    /** `px` (`p-px`, `m-px`, `gap-px`…): 1px. */
    public static let spacingPx: CGFloat = 1
    /** `0.5` (`p-0.5`, `m-0.5`, `gap-0.5`…): 2px. */
    public static let spacing0_5: CGFloat = 2
    /** `1` (`p-1`, `m-1`, `gap-1`…): 4px. Icon-to-label gaps. */
    public static let spacing1: CGFloat = 4
    /** `1.5` (`p-1.5`, `m-1.5`, `gap-1.5`…): 6px. */
    public static let spacing1_5: CGFloat = 6
    /** `2` (`p-2`, `m-2`, `gap-2`…): 8px. Tight gaps inside controls. */
    public static let spacing2: CGFloat = 8
    /** `2.5` (`p-2.5`, `m-2.5`, `gap-2.5`…): 10px. */
    public static let spacing2_5: CGFloat = 10
    /** `3` (`p-3`, `m-3`, `gap-3`…): 12px. */
    public static let spacing3: CGFloat = 12
    /** `3.5` (`p-3.5`, `m-3.5`, `gap-3.5`…): 14px. */
    public static let spacing3_5: CGFloat = 14
    /** `4` (`p-4`, `m-4`, `gap-4`…): 16px. Default padding and gaps. */
    public static let spacing4: CGFloat = 16
    /** `5` (`p-5`, `m-5`, `gap-5`…): 20px. */
    public static let spacing5: CGFloat = 20
    /** `6` (`p-6`, `m-6`, `gap-6`…): 24px. Dialog and drawer padding. */
    public static let spacing6: CGFloat = 24
    /** `7` (`p-7`, `m-7`, `gap-7`…): 28px. */
    public static let spacing7: CGFloat = 28
    /** `8` (`p-8`, `m-8`, `gap-8`…): 32px. Gaps between groups. */
    public static let spacing8: CGFloat = 32
    /** `9` (`p-9`, `m-9`, `gap-9`…): 36px. */
    public static let spacing9: CGFloat = 36
    /** `10` (`p-10`, `m-10`, `gap-10`…): 40px. */
    public static let spacing10: CGFloat = 40
    /** `11` (`p-11`, `m-11`, `gap-11`…): 44px. */
    public static let spacing11: CGFloat = 44
    /** `12` (`p-12`, `m-12`, `gap-12`…): 48px. Section spacing. */
    public static let spacing12: CGFloat = 48
    /** `14` (`p-14`, `m-14`, `gap-14`…): 56px. */
    public static let spacing14: CGFloat = 56
    /** `16` (`p-16`, `m-16`, `gap-16`…): 64px. Large section spacing. */
    public static let spacing16: CGFloat = 64
    /** `20` (`p-20`, `m-20`, `gap-20`…): 80px. */
    public static let spacing20: CGFloat = 80
    /** `24` (`p-24`, `m-24`, `gap-24`…): 96px. */
    public static let spacing24: CGFloat = 96
    /** `28` (`p-28`, `m-28`, `gap-28`…): 112px. */
    public static let spacing28: CGFloat = 112
    /** `32` (`p-32`, `m-32`, `gap-32`…): 128px. */
    public static let spacing32: CGFloat = 128
    /** `36` (`p-36`, `m-36`, `gap-36`…): 144px. */
    public static let spacing36: CGFloat = 144
    /** `40` (`p-40`, `m-40`, `gap-40`…): 160px. */
    public static let spacing40: CGFloat = 160
    /** `44` (`p-44`, `m-44`, `gap-44`…): 176px. */
    public static let spacing44: CGFloat = 176
    /** `48` (`p-48`, `m-48`, `gap-48`…): 192px. */
    public static let spacing48: CGFloat = 192
    /** `52` (`p-52`, `m-52`, `gap-52`…): 208px. */
    public static let spacing52: CGFloat = 208
    /** `56` (`p-56`, `m-56`, `gap-56`…): 224px. */
    public static let spacing56: CGFloat = 224
    /** `60` (`p-60`, `m-60`, `gap-60`…): 240px. */
    public static let spacing60: CGFloat = 240
    /** `64` (`p-64`, `m-64`, `gap-64`…): 256px. */
    public static let spacing64: CGFloat = 256
    /** `72` (`p-72`, `m-72`, `gap-72`…): 288px. */
    public static let spacing72: CGFloat = 288
    /** `80` (`p-80`, `m-80`, `gap-80`…): 320px. */
    public static let spacing80: CGFloat = 320
    /** `96` (`p-96`, `m-96`, `gap-96`…): 384px. */
    public static let spacing96: CGFloat = 384
    /** Between an icon and its label, or a mark and its text. 4px. */
    public static let spaceInline: CGFloat = 4
    /** Between the parts of one control, or items that belong together: a field's label and input, buttons in a group. 8px. */
    public static let spaceRelated: CGFloat = 8
    /** The default padding and gap: inside a popover, between fields of a form. Popover, HoverCard, Tour and Accordion read it for their padding. 16px; 12px in the compact density. */
    public static let spaceContent: CGFloat = 16
    /** The padding of a card at its default size (Card padding md). 20px; 12px in the compact density. */
    public static let spaceCard: CGFloat = 20
    /** The block padding of a row in a table or a list (Table, List). 12px; 6px in the compact density. */
    public static let spaceRow: CGFloat = 12
    /** The block padding of a denser row: a data grid's cell, a small table's row, a sidebar's item. 8px; 4px in the compact density. */
    public static let spaceItem: CGFloat = 8
    /** The padding of a dialog, a drawer or a large card (Card padding lg), which read it for theirs. 24px; 16px in the compact density. */
    public static let spaceSurface: CGFloat = 24
    /** Between the sections of a long-form or marketing page. 32px. */
    public static let spaceSection: CGFloat = 32
    /** On an app screen: between the page header, the sections and the cards. 24px. */
    public static let spacePage: CGFloat = 24
    /** On a long-form or marketing page: after the page header and between bands. 64px. */
    public static let spaceBand: CGFloat = 64
    /** `rounded-none`: Square corners. */
    public static let roundedNone: CGFloat = 0
    /** `rounded-xs`: 2px. Tags, small chips, focus outlines. */
    public static let roundedXs: CGFloat = 2
    /** `rounded-sm`: 4px. Inputs, small buttons, checkboxes. */
    public static let roundedSm: CGFloat = 4
    /** `rounded`: 4px. Same as `rounded-sm`; kept for older code. */
    public static let rounded: CGFloat = 4
    /** `rounded-md`: 6px. Buttons, inputs (Button uses it). */
    public static let roundedMd: CGFloat = 6
    /** `rounded-lg`: 8px. Cards, menus, popovers. */
    public static let roundedLg: CGFloat = 8
    /** `rounded-xl`: 12px. Large cards, panels. */
    public static let roundedXl: CGFloat = 12
    /** `rounded-2xl`: 16px. Modals, feature cards. */
    public static let rounded2xl: CGFloat = 16
    /** `rounded-3xl`: 24px. Hero blocks, large surfaces. */
    public static let rounded3xl: CGFloat = 24
    /** `rounded-4xl`: 32px. Very large surfaces, marketing blocks. */
    public static let rounded4xl: CGFloat = 32
    /** `rounded-full`: Pills and circles: avatars, badges, toggles. */
    public static let roundedFull: CGFloat = 9999
    /** A small part inside or beside a control: a checkbox, a key, a clear or stepper button, the indicator of a segmented control, the focus ring of a link in text, inline code. 4px. */
    public static let radiusInner: CGFloat = 4
    /** A control or an item people press or type in: buttons, inputs, selects, tabs, badges, tooltips, and the items of a menu, list box, sidebar or tree. 6px. */
    public static let radiusControl: CGFloat = 6
    /** A surface that holds content or floats over the page: alerts, tables, lists, accordions, drop zones, and menus, popovers, list boxes and toasts. 8px. */
    public static let radiusSurface: CGFloat = 8
    /** A large container: cards, dialogs, drawers and carousels. 12px. */
    public static let radiusContainer: CGFloat = 12
    /** A pill or a circle: tracks and thumbs, steps, round buttons and swatches. */
    public static let radiusPill: CGFloat = 9999
    /** `border-0`. */
    public static let borderWidth0: CGFloat = 0
    /** `border-1` (`border`): the default hairline. */
    public static let borderWidth1: CGFloat = 1
    /** `border-2`. Focus and selected states. */
    public static let borderWidth2: CGFloat = 2
    /** `border-4`. */
    public static let borderWidth4: CGFloat = 4
    /** `border-8`. */
    public static let borderWidth8: CGFloat = 8
    /** `outline-0`. */
    public static let outlineWidth0: CGFloat = 0
    /** `outline-1` (`outline`). */
    public static let outlineWidth1: CGFloat = 1
    /** `outline-2`. Focus outlines. */
    public static let outlineWidth2: CGFloat = 2
    /** `outline-4`. */
    public static let outlineWidth4: CGFloat = 4
    /** `outline-8`. */
    public static let outlineWidth8: CGFloat = 8
    /** `outline-offset-0`. */
    public static let outlineOffset0: CGFloat = 0
    /** `outline-offset-1`. */
    public static let outlineOffset1: CGFloat = 1
    /** `outline-offset-2`. Gap between an element and its focus outline. */
    public static let outlineOffset2: CGFloat = 2
    /** `outline-offset-4`. */
    public static let outlineOffset4: CGFloat = 4
    /** `outline-offset-8`. */
    public static let outlineOffset8: CGFloat = 8
    /** The focus ring's width: `outline: var(--focus-ring-width) solid var(--focus-ring)`. Every component's focus ring uses it. A third thicker (3px) with more contrast. */
    public static let focusRingWidth: CGFloat = 2
    /** The width of the bar that `highlight-indicator` colors on a current or selected item: Sidebar's current page, Navbar's current link, and the selected row of List, TreeView and Table. 0 by default, so no bar is drawn and the fill alone marks the item, whatever fill it has (hovered, pressed or a component's own). 2px with more contrast (`data-contrast="more"` or the system setting), where the bar is `text`-dark. */
    public static let highlightIndicatorWidth: CGFloat = 0
    /** The transparent gap between an element and its focus ring (`outline-offset`). Inset rings, where an outline would be clipped, use 0. */
    public static let focusRingOffset: CGFloat = 2
    /** 256px, used by `w-3xs`, `min-w-3xs`, `max-w-3xs`, `inline-3xs`, `min-inline-3xs`, `max-inline-3xs`. Narrow popovers, sidebars. */
    public static let container3xs: CGFloat = 256
    /** 288px, used by `w-2xs`, `min-w-2xs`, `max-w-2xs`, `inline-2xs`, `min-inline-2xs`, `max-inline-2xs`. Sidebars, filter panels. */
    public static let container2xs: CGFloat = 288
    /** 320px, used by `w-xs`, `min-w-xs`, `max-w-xs`, `inline-xs`, `min-inline-xs`, `max-inline-xs`. Small dialogs, popover cards. */
    public static let containerXs: CGFloat = 320
    /** 384px, used by `w-sm`, `min-w-sm`, `max-w-sm`, `inline-sm`, `min-inline-sm`, `max-inline-sm`. Sign-in forms, narrow dialogs. */
    public static let containerSm: CGFloat = 384
    /** 448px, used by `w-md`, `min-w-md`, `max-w-md`, `inline-md`, `min-inline-md`, `max-inline-md`. Standard dialogs. */
    public static let containerMd: CGFloat = 448
    /** 512px, used by `w-lg`, `min-w-lg`, `max-w-lg`, `inline-lg`, `min-inline-lg`, `max-inline-lg`. Wide dialogs, forms. */
    public static let containerLg: CGFloat = 512
    /** 576px, used by `w-xl`, `min-w-xl`, `max-w-xl`, `inline-xl`, `min-inline-xl`, `max-inline-xl`. Side panels, form pages. */
    public static let containerXl: CGFloat = 576
    /** 672px, used by `w-2xl`, `min-w-2xl`, `max-w-2xl`, `inline-2xl`, `min-inline-2xl`, `max-inline-2xl`. Settings pages, long forms. */
    public static let container2xl: CGFloat = 672
    /** 768px, used by `w-3xl`, `min-w-3xl`, `max-w-3xl`, `inline-3xl`, `min-inline-3xl`, `max-inline-3xl`. Article and document bodies with images. */
    public static let container3xl: CGFloat = 768
    /** 896px, used by `w-4xl`, `min-w-4xl`, `max-w-4xl`, `inline-4xl`, `min-inline-4xl`, `max-inline-4xl`. Content pages. */
    public static let container4xl: CGFloat = 896
    /** 1024px, used by `w-5xl`, `min-w-5xl`, `max-w-5xl`, `inline-5xl`, `min-inline-5xl`, `max-inline-5xl`. Dashboards with a sidebar. */
    public static let container5xl: CGFloat = 1024
    /** 1152px, used by `w-6xl`, `min-w-6xl`, `max-w-6xl`, `inline-6xl`, `min-inline-6xl`, `max-inline-6xl`. Wide app layouts. */
    public static let container6xl: CGFloat = 1152
    /** 1280px, used by `w-7xl`, `min-w-7xl`, `max-w-7xl`, `inline-7xl`, `min-inline-7xl`, `max-inline-7xl`. Marketing and full app shells. */
    public static let container7xl: CGFloat = 1280
    /** One pixel: hairlines. */
    public static let sizingPx: CGFloat = 1
    /** Height of small controls (24px): `sm` buttons, compact inputs. The WCAG 2.2 AA minimum target size. */
    public static let controlHeightSm: CGFloat = 24
    /** Height of default controls (32px): buttons, inputs and selects line up at this height. */
    public static let controlHeightMd: CGFloat = 32
    /** Height of large controls (44px), the comfortable touch target (WCAG 2.5.5). */
    public static let controlHeightLg: CGFloat = 44
    /** `opacity-0`, `backdrop-opacity-0`. Hidden but still in the layout. */
    public static let opacity0: Double = 0
    /** `opacity-5`, `backdrop-opacity-5`. */
    public static let opacity5: Double = 0.05
    /** `opacity-10`, `backdrop-opacity-10`. */
    public static let opacity10: Double = 0.1
    /** `opacity-15`, `backdrop-opacity-15`. */
    public static let opacity15: Double = 0.15
    /** `opacity-20`, `backdrop-opacity-20`. */
    public static let opacity20: Double = 0.2
    /** `opacity-25`, `backdrop-opacity-25`. */
    public static let opacity25: Double = 0.25
    /** `opacity-30`, `backdrop-opacity-30`. */
    public static let opacity30: Double = 0.3
    /** `opacity-35`, `backdrop-opacity-35`. */
    public static let opacity35: Double = 0.35
    /** `opacity-40`, `backdrop-opacity-40`. */
    public static let opacity40: Double = 0.4
    /** `opacity-45`, `backdrop-opacity-45`. */
    public static let opacity45: Double = 0.45
    /** `opacity-50`, `backdrop-opacity-50`. For disabled controls use `opacity-disabled`. */
    public static let opacity50: Double = 0.5
    /** `opacity-55`, `backdrop-opacity-55`. */
    public static let opacity55: Double = 0.55
    /** `opacity-60`, `backdrop-opacity-60`. */
    public static let opacity60: Double = 0.6
    /** `opacity-65`, `backdrop-opacity-65`. */
    public static let opacity65: Double = 0.65
    /** `opacity-70`, `backdrop-opacity-70`. */
    public static let opacity70: Double = 0.7
    /** `opacity-75`, `backdrop-opacity-75`. */
    public static let opacity75: Double = 0.75
    /** `opacity-80`, `backdrop-opacity-80`. */
    public static let opacity80: Double = 0.8
    /** `opacity-85`, `backdrop-opacity-85`. */
    public static let opacity85: Double = 0.85
    /** `opacity-90`, `backdrop-opacity-90`. */
    public static let opacity90: Double = 0.9
    /** `opacity-95`, `backdrop-opacity-95`. */
    public static let opacity95: Double = 0.95
    /** `opacity-100`, `backdrop-opacity-100`. Fully opaque. */
    public static let opacity100: Double = 1
    /** `opacity-disabled`. Every disabled control and item (50%). Set it once to change how disabled looks everywhere. */
    public static let opacityDisabled: Double = 0.5
    /** The `state-layer` class on hover (8%): the element's text color laid over its own background. For surfaces the app colors itself; components keep their own tuned hover colors. */
    public static let opacityStateHover: Double = 0.08
    /** The `state-layer` class while pressed (12%). */
    public static let opacityStatePressed: Double = 0.12
    /** The `state-layer` class while dragged (16%), with `data-state="dragging"`. */
    public static let opacityStateDragged: Double = 0.16
    /** Instant: no transition. */
    public static let duration0: TimeInterval = 0
    /** Micro feedback: checkbox ticks, toggles. */
    public static let duration75: TimeInterval = 0.075
    /** Presses and small exits: a button held down, a tooltip leaving. */
    public static let duration100: TimeInterval = 0.1
    /** Default: hover and focus colors, and small surfaces entering (tooltips, popovers, menus, date pickers). */
    public static let duration150: TimeInterval = 0.15
    /** Medium surfaces entering: dialogs and toasts. */
    public static let duration200: TimeInterval = 0.2
    /** Large surfaces entering: drawers and sheets. */
    public static let duration300: TimeInterval = 0.3
    /** Large surfaces or page-level changes. */
    public static let duration500: TimeInterval = 0.5
    /** Slow, deliberate emphasis. Use rarely. */
    public static let duration700: TimeInterval = 0.7
    /** Decorative or attention animations only. */
    public static let duration1000: TimeInterval = 1
    /** Long loops, such as the pixel loader (1.2s). Decorative only. */
    public static let duration1200: TimeInterval = 1.2
    /** No wait: `delay-0` cancels a delay set elsewhere. */
    public static let delay0: TimeInterval = 0
    /** One step of a stagger: the gap between list items arriving (`motion-stagger`). */
    public static let delay50: TimeInterval = 0.05
    /** One step of the pixel Loader's wave (`--loader-pixel-stagger`). */
    public static let delay75: TimeInterval = 0.075
    /** Short: a tooltip waits this long to close once the pointer leaves it. */
    public static let delay100: TimeInterval = 0.1
    /** The gap between the dots Loader's dots (`--loader-dots-stagger`). */
    public static let delay150: TimeInterval = 0.15
    /** Offsets one square of the random pixel Loader. */
    public static let delay200: TimeInterval = 0.2
    /** A loading indicator waits this long before it shows, so a quick wait doesn't flash one. */
    public static let delay300: TimeInterval = 0.3
    /** A HoverCard waits this long before it opens; a loading indicator, once shown, stays at least this long. */
    public static let delay500: TimeInterval = 0.5
    /** Offsets one square of the random pixel Loader. */
    public static let delay700: TimeInterval = 0.7
    /** Offsets one square of the random pixel Loader; the longest wait. */
    public static let delay1000: TimeInterval = 1
    /** A press: a control answering while it's held down (Button scales down). */
    public static let motionPress: TimeInterval = 0.1
    /** A press let go: the control springing back to its size with `ease-spring`. Longer than the press, because a spring spends its end settling; it is back in place in about a third of this. */
    public static let motionRelease: TimeInterval = 0.3
    /** Hover and focus changes: colors, borders and shadows on a control that stays put. */
    public static let motionHover: TimeInterval = 0.15
    /** A small surface appearing: tooltips, popovers, menus, date pickers. */
    public static let motionEnterSm: TimeInterval = 0.15
    /** A medium surface appearing: dialogs and toasts. */
    public static let motionEnterMd: TimeInterval = 0.2
    /** A large surface appearing: drawers and sheets. */
    public static let motionEnterLg: TimeInterval = 0.3
    /** A small surface leaving. An exit takes about two thirds of its enter, so what was closed gets out of the way. */
    public static let motionExitSm: TimeInterval = 0.1
    /** A medium surface leaving: dialogs and toasts. */
    public static let motionExitMd: TimeInterval = 0.15
    /** A large surface leaving: drawers and sheets. */
    public static let motionExitLg: TimeInterval = 0.2
    /** A small part changing in place: a chevron turning, a slider thumb growing, a dot widening, a row gliding to its place. */
    public static let motionChangeSm: TimeInterval = 0.15
    /** A panel opening or collapsing in place, or an indicator sliding to the selected option: Accordion, Sidebar, SegmentedControl, Tabs. */
    public static let motionChangeMd: TimeInterval = 0.2
    /** Something travelling far on screen: a progress or meter fill moving to its value, a carousel slide. */
    public static let motionChangeLg: TimeInterval = 0.3
    /** One turn of a spinner, the one spinner speed: Loader's ring (and so Button, Badge and SearchInput), Switch and the circular Progress while they load. Under reduced motion they stand still and breathe over twice this. */
    public static let motionLoopSpinner: TimeInterval = 0.7
    /** One pass of a loading placeholder's pulse: Image while it loads. */
    public static let motionLoopPlaceholder: TimeInterval = 1
    /** One blink of a text caret: PinInput. */
    public static let motionLoopBlink: TimeInterval = 1
    /** One pass of an indeterminate progress bar. */
    public static let motionLoopProgress: TimeInterval = 1.2
    /** A press ripple spreading out from the pointer: Button and Badge. */
    public static let motionRipple: TimeInterval = 0.5
    /** A press ripple fading once it has spread. */
    public static let motionRippleFade: TimeInterval = 0.3
    /** The gap between items of a group arriving one after another, for a group seen now and then (a page's cards, a first list of results), never one opened over and over (menu items, toasts). Each item waits its index times this. */
    public static let motionStagger: TimeInterval = 0.05
    /** The longest any item of a staggered group waits, so a long list still arrives within a moment: items past the sixth arrive together. */
    public static let motionStaggerLimit: TimeInterval = 0.3
    /** The offset between the steps of one entrance, so they read as a sequence: a dialog or drawer’s backdrop starts, then its panel. Exits don’t sequence; everything leaves together. */
    public static let motionSequence: TimeInterval = 0.05
    /** `text-xs` font size (12px). */
    public static let textXs: CGFloat = 12
    /** `text-sm` font size (14px). */
    public static let textSm: CGFloat = 14
    /** `text-base` font size (16px). */
    public static let textBase: CGFloat = 16
    /** `text-lg` font size (18px). */
    public static let textLg: CGFloat = 18
    /** `text-xl` font size (20px). */
    public static let textXl: CGFloat = 20
    /** `text-2xl` font size (24px). */
    public static let text2xl: CGFloat = 24
    /** `text-3xl` font size (30px). */
    public static let text3xl: CGFloat = 30
    /** `text-4xl` font size (36px). */
    public static let text4xl: CGFloat = 36
    /** `text-5xl` font size (48px). */
    public static let text5xl: CGFloat = 48
    /** `text-6xl` font size (60px). */
    public static let text6xl: CGFloat = 60
    /** `text-7xl` font size (72px). */
    public static let text7xl: CGFloat = 72
    /** `text-8xl` font size (96px). */
    public static let text8xl: CGFloat = 96
    /** `text-9xl` font size (128px). */
    public static let text9xl: CGFloat = 128
    /** The line height that goes with `text-xs`. */
    public static let textXsLineHeight: CGFloat = 16
    /** The line height that goes with `text-sm`. */
    public static let textSmLineHeight: CGFloat = 20
    /** The line height that goes with `text-base`. */
    public static let textBaseLineHeight: CGFloat = 24
    /** The line height that goes with `text-lg`. */
    public static let textLgLineHeight: CGFloat = 28
    /** The line height that goes with `text-xl`. */
    public static let textXlLineHeight: CGFloat = 28
    /** The line height that goes with `text-2xl`. */
    public static let text2xlLineHeight: CGFloat = 32
    /** The line height that goes with `text-3xl`. */
    public static let text3xlLineHeight: CGFloat = 36
    /** The line height that goes with `text-4xl`. */
    public static let text4xlLineHeight: CGFloat = 40
}

/// Every color of the palette, the same in every theme.
public enum SerupaPalette {
    /** Pure white. */
    public static let white = Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    /** Pure black. */
    public static let black = Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let slate50 = Color(.sRGB, red: 0.9725, green: 0.9804, blue: 0.9882, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    public static let slate100 = Color(.sRGB, red: 0.9451, green: 0.9608, blue: 0.9765, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    public static let slate200 = Color(.sRGB, red: 0.8863, green: 0.9098, blue: 0.9412, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.1:1). */
    public static let slate300 = Color(.sRGB, red: 0.7961, green: 0.8353, blue: 0.8824, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.2:1). */
    public static let slate400 = Color(.sRGB, red: 0.5804, green: 0.6392, blue: 0.7216, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    public static let slate500 = Color(.sRGB, red: 0.3922, green: 0.4549, blue: 0.5451, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    public static let slate600 = Color(.sRGB, red: 0.2784, green: 0.3333, blue: 0.4118, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    public static let slate700 = Color(.sRGB, red: 0.2, green: 0.2549, blue: 0.3333, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    public static let slate800 = Color(.sRGB, red: 0.1176, green: 0.1608, blue: 0.2314, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (17.9:1). */
    public static let slate900 = Color(.sRGB, red: 0.0588, green: 0.0902, blue: 0.1647, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (20.2:1). */
    public static let slate950 = Color(.sRGB, red: 0.0078, green: 0.0235, blue: 0.0902, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let gray50 = Color(.sRGB, red: 0.9765, green: 0.9804, blue: 0.9843, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    public static let gray100 = Color(.sRGB, red: 0.9529, green: 0.9569, blue: 0.9647, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    public static let gray200 = Color(.sRGB, red: 0.898, green: 0.9059, blue: 0.9216, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.3:1). */
    public static let gray300 = Color(.sRGB, red: 0.8196, green: 0.8353, blue: 0.8588, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    public static let gray400 = Color(.sRGB, red: 0.6118, green: 0.6392, blue: 0.6863, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    public static let gray500 = Color(.sRGB, red: 0.4196, green: 0.4471, blue: 0.502, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    public static let gray600 = Color(.sRGB, red: 0.2941, green: 0.3333, blue: 0.3882, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.3:1). */
    public static let gray700 = Color(.sRGB, red: 0.2157, green: 0.2549, blue: 0.3176, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.7:1). */
    public static let gray800 = Color(.sRGB, red: 0.1216, green: 0.1608, blue: 0.2157, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (17.7:1). */
    public static let gray900 = Color(.sRGB, red: 0.0667, green: 0.0941, blue: 0.1529, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (20.1:1). */
    public static let gray950 = Color(.sRGB, red: 0.0118, green: 0.0275, blue: 0.0706, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let zinc50 = Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    public static let zinc100 = Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.6:1). */
    public static let zinc200 = Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    public static let zinc300 = Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.2:1). */
    public static let zinc400 = Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    public static let zinc500 = Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.7:1). */
    public static let zinc600 = Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    public static let zinc700 = Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.9:1). */
    public static let zinc800 = Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (17.7:1). */
    public static let zinc900 = Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (19.9:1). */
    public static let zinc950 = Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let neutral50 = Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.3:1). */
    public static let neutral100 = Color(.sRGB, red: 0.9608, green: 0.9608, blue: 0.9608, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    public static let neutral200 = Color(.sRGB, red: 0.898, green: 0.898, blue: 0.898, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    public static let neutral300 = Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8314, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    public static let neutral400 = Color(.sRGB, red: 0.6392, green: 0.6392, blue: 0.6392, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    public static let neutral500 = Color(.sRGB, red: 0.451, green: 0.451, blue: 0.451, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.8:1). */
    public static let neutral600 = Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3216, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    public static let neutral700 = Color(.sRGB, red: 0.251, green: 0.251, blue: 0.251, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.1:1). */
    public static let neutral800 = Color(.sRGB, red: 0.149, green: 0.149, blue: 0.149, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (17.9:1). */
    public static let neutral900 = Color(.sRGB, red: 0.0902, green: 0.0902, blue: 0.0902, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (19.8:1). */
    public static let neutral950 = Color(.sRGB, red: 0.0392, green: 0.0392, blue: 0.0392, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let stone50 = Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9765, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    public static let stone100 = Color(.sRGB, red: 0.9608, green: 0.9608, blue: 0.9569, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    public static let stone200 = Color(.sRGB, red: 0.9059, green: 0.898, blue: 0.8941, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.1:1). */
    public static let stone300 = Color(.sRGB, red: 0.8392, green: 0.8275, blue: 0.8196, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    public static let stone400 = Color(.sRGB, red: 0.6588, green: 0.6353, blue: 0.6196, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    public static let stone500 = Color(.sRGB, red: 0.4706, green: 0.4431, blue: 0.4235, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    public static let stone600 = Color(.sRGB, red: 0.3412, green: 0.3255, blue: 0.3059, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.3:1). */
    public static let stone700 = Color(.sRGB, red: 0.2667, green: 0.251, blue: 0.2353, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    public static let stone800 = Color(.sRGB, red: 0.1608, green: 0.1451, blue: 0.1412, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (17.5:1). */
    public static let stone900 = Color(.sRGB, red: 0.1098, green: 0.098, blue: 0.0902, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (19.8:1). */
    public static let stone950 = Color(.sRGB, red: 0.0471, green: 0.0392, blue: 0.0353, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    public static let red50 = Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.2:1). */
    public static let red100 = Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.5:1). */
    public static let red200 = Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.1:1). */
    public static let red300 = Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.6:1). */
    public static let red400 = Color(.sRGB, red: 0.9725, green: 0.4431, blue: 0.4431, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.8:1); black 5.6:1. */
    public static let red500 = Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    public static let red600 = Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.5:1). */
    public static let red700 = Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.3:1). */
    public static let red800 = Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.0:1). */
    public static let red900 = Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (16.1:1). */
    public static let red950 = Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.8:1). */
    public static let orange50 = Color(.sRGB, red: 1, green: 0.9686, blue: 0.9294, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.3:1). */
    public static let orange100 = Color(.sRGB, red: 1, green: 0.9294, blue: 0.8353, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.5:1). */
    public static let orange200 = Color(.sRGB, red: 0.9961, green: 0.8431, blue: 0.6667, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.5:1). */
    public static let orange300 = Color(.sRGB, red: 0.9922, green: 0.7294, blue: 0.4549, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 9.3:1). */
    public static let orange400 = Color(.sRGB, red: 0.9843, green: 0.5725, blue: 0.2353, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.5:1). */
    public static let orange500 = Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.6:1); black 5.9:1. */
    public static let orange600 = Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.2:1). */
    public static let orange700 = Color(.sRGB, red: 0.7608, green: 0.2549, blue: 0.0471, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.3:1). */
    public static let orange800 = Color(.sRGB, red: 0.6039, green: 0.2039, blue: 0.0706, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.4:1). */
    public static let orange900 = Color(.sRGB, red: 0.4863, green: 0.1765, blue: 0.0706, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.7:1). */
    public static let orange950 = Color(.sRGB, red: 0.2627, green: 0.0784, blue: 0.0275, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    public static let amber50 = Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.9:1). */
    public static let amber100 = Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.9:1). */
    public static let amber200 = Color(.sRGB, red: 0.9922, green: 0.902, blue: 0.5412, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.6:1). */
    public static let amber300 = Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.6:1). */
    public static let amber400 = Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 9.8:1). */
    public static let amber500 = Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.2:1); black 6.6:1. */
    public static let amber600 = Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    public static let amber700 = Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    public static let amber800 = Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    public static let amber900 = Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    public static let amber950 = Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    public static let yellow50 = Color(.sRGB, red: 0.9961, green: 0.9882, blue: 0.9098, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    public static let yellow100 = Color(.sRGB, red: 0.9961, green: 0.9765, blue: 0.7647, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.0:1). */
    public static let yellow200 = Color(.sRGB, red: 0.9961, green: 0.9412, blue: 0.5412, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 15.9:1). */
    public static let yellow300 = Color(.sRGB, red: 0.9922, green: 0.8784, blue: 0.2784, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.7:1). */
    public static let yellow400 = Color(.sRGB, red: 0.9804, green: 0.8, blue: 0.0824, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 11.0:1). */
    public static let yellow500 = Color(.sRGB, red: 0.9176, green: 0.702, blue: 0.0314, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.1:1). */
    public static let yellow600 = Color(.sRGB, red: 0.7922, green: 0.5412, blue: 0.0157, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (4.9:1). */
    public static let yellow700 = Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.9:1). */
    public static let yellow800 = Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    public static let yellow900 = Color(.sRGB, red: 0.4431, green: 0.2471, blue: 0.0706, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    public static let yellow950 = Color(.sRGB, red: 0.2588, green: 0.1255, blue: 0.0235, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    public static let lime50 = Color(.sRGB, red: 0.9686, green: 0.9961, blue: 0.9059, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.4:1). */
    public static let lime100 = Color(.sRGB, red: 0.9255, green: 0.9882, blue: 0.7961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.0:1). */
    public static let lime200 = Color(.sRGB, red: 0.851, green: 0.9765, blue: 0.6157, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 16.1:1). */
    public static let lime300 = Color(.sRGB, red: 0.7451, green: 0.949, blue: 0.3922, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.9:1). */
    public static let lime400 = Color(.sRGB, red: 0.6392, green: 0.902, blue: 0.2078, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 10.6:1). */
    public static let lime500 = Color(.sRGB, red: 0.5176, green: 0.8, blue: 0.0863, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.1:1); black 6.8:1. */
    public static let lime600 = Color(.sRGB, red: 0.3961, green: 0.6392, blue: 0.051, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    public static let lime700 = Color(.sRGB, red: 0.302, green: 0.4863, blue: 0.0588, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    public static let lime800 = Color(.sRGB, red: 0.2471, green: 0.3843, blue: 0.0706, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    public static let lime900 = Color(.sRGB, red: 0.2118, green: 0.3255, blue: 0.0784, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    public static let lime950 = Color(.sRGB, red: 0.102, green: 0.1804, blue: 0.0196, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let green50 = Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    public static let green100 = Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.3:1). */
    public static let green200 = Color(.sRGB, red: 0.7333, green: 0.9686, blue: 0.8157, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 15.0:1). */
    public static let green300 = Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.1:1). */
    public static let green400 = Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 9.2:1). */
    public static let green500 = Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.3:1); black 6.4:1. */
    public static let green600 = Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    public static let green700 = Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    public static let green800 = Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    public static let green900 = Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.9:1). */
    public static let green950 = Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.9:1). */
    public static let emerald50 = Color(.sRGB, red: 0.9255, green: 0.9922, blue: 0.9608, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.5:1). */
    public static let emerald100 = Color(.sRGB, red: 0.8196, green: 0.9804, blue: 0.898, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.4:1). */
    public static let emerald200 = Color(.sRGB, red: 0.6549, green: 0.9529, blue: 0.8157, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.8:1). */
    public static let emerald300 = Color(.sRGB, red: 0.4314, green: 0.9059, blue: 0.7176, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 10.9:1). */
    public static let emerald400 = Color(.sRGB, red: 0.2039, green: 0.8275, blue: 0.6, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.3:1). */
    public static let emerald500 = Color(.sRGB, red: 0.0627, green: 0.7255, blue: 0.5059, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.8:1); black 5.6:1. */
    public static let emerald600 = Color(.sRGB, red: 0.0196, green: 0.5882, blue: 0.4118, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.5:1). */
    public static let emerald700 = Color(.sRGB, red: 0.0157, green: 0.4706, blue: 0.3412, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.7:1). */
    public static let emerald800 = Color(.sRGB, red: 0.0235, green: 0.3725, blue: 0.2745, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.7:1). */
    public static let emerald900 = Color(.sRGB, red: 0.0235, green: 0.3059, blue: 0.2314, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    public static let emerald950 = Color(.sRGB, red: 0.0078, green: 0.1725, blue: 0.1333, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    public static let teal50 = Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9804, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.6:1). */
    public static let teal100 = Color(.sRGB, red: 0.8, green: 0.9843, blue: 0.9451, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    public static let teal200 = Color(.sRGB, red: 0.6, green: 0.9647, blue: 0.8941, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    public static let teal300 = Color(.sRGB, red: 0.3686, green: 0.9176, blue: 0.8314, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.3:1). */
    public static let teal400 = Color(.sRGB, red: 0.1765, green: 0.8314, blue: 0.749, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.4:1). */
    public static let teal500 = Color(.sRGB, red: 0.0784, green: 0.7216, blue: 0.651, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.6:1. */
    public static let teal600 = Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.5:1). */
    public static let teal700 = Color(.sRGB, red: 0.0588, green: 0.4627, blue: 0.4314, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.6:1). */
    public static let teal800 = Color(.sRGB, red: 0.0667, green: 0.3686, blue: 0.349, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.5:1). */
    public static let teal900 = Color(.sRGB, red: 0.0745, green: 0.3059, blue: 0.2902, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.5:1). */
    public static let teal950 = Color(.sRGB, red: 0.0157, green: 0.1843, blue: 0.1804, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.2:1). */
    public static let cyan50 = Color(.sRGB, red: 0.9255, green: 0.9961, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.8:1). */
    public static let cyan100 = Color(.sRGB, red: 0.8118, green: 0.9804, blue: 0.9961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.8:1). */
    public static let cyan200 = Color(.sRGB, red: 0.6471, green: 0.9529, blue: 0.9882, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.5:1). */
    public static let cyan300 = Color(.sRGB, red: 0.4039, green: 0.9098, blue: 0.9765, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    public static let cyan400 = Color(.sRGB, red: 0.1333, green: 0.8275, blue: 0.9333, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.6:1). */
    public static let cyan500 = Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    public static let cyan600 = Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.4:1). */
    public static let cyan700 = Color(.sRGB, red: 0.0549, green: 0.4549, blue: 0.5647, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.3:1). */
    public static let cyan800 = Color(.sRGB, red: 0.0824, green: 0.3686, blue: 0.4588, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    public static let cyan900 = Color(.sRGB, red: 0.0863, green: 0.3059, blue: 0.3882, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (13.4:1). */
    public static let cyan950 = Color(.sRGB, red: 0.0314, green: 0.2, blue: 0.2667, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.7:1). */
    public static let sky50 = Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.3:1). */
    public static let sky100 = Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.8:1). */
    public static let sky200 = Color(.sRGB, red: 0.7294, green: 0.902, blue: 0.9922, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.6:1). */
    public static let sky300 = Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 9.8:1). */
    public static let sky400 = Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.6:1). */
    public static let sky500 = Color(.sRGB, red: 0.0549, green: 0.6471, blue: 0.9137, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.1:1); black 5.1:1. */
    public static let sky600 = Color(.sRGB, red: 0.0078, green: 0.5176, blue: 0.7804, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (5.9:1). */
    public static let sky700 = Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.6:1). */
    public static let sky800 = Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.5:1). */
    public static let sky900 = Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (13.9:1). */
    public static let sky950 = Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.3:1). */
    public static let blue50 = Color(.sRGB, red: 0.9373, green: 0.9647, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.2:1). */
    public static let blue100 = Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.8:1). */
    public static let blue200 = Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    public static let blue300 = Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    public static let blue400 = Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    public static let blue500 = Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.2:1). */
    public static let blue600 = Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.7:1). */
    public static let blue700 = Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    public static let blue800 = Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    public static let blue900 = Color(.sRGB, red: 0.1176, green: 0.2275, blue: 0.5412, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.7:1). */
    public static let blue950 = Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.8:1). */
    public static let indigo50 = Color(.sRGB, red: 0.9333, green: 0.949, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    public static let indigo100 = Color(.sRGB, red: 0.8784, green: 0.9059, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.1:1). */
    public static let indigo200 = Color(.sRGB, red: 0.7804, green: 0.8235, blue: 0.9961, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 10.5:1). */
    public static let indigo300 = Color(.sRGB, red: 0.6471, green: 0.7059, blue: 0.9882, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.0:1). */
    public static let indigo400 = Color(.sRGB, red: 0.5059, green: 0.549, blue: 0.9725, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.5:1); black 4.7:1. */
    public static let indigo500 = Color(.sRGB, red: 0.3882, green: 0.4, blue: 0.9451, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (6.3:1). */
    public static let indigo600 = Color(.sRGB, red: 0.3098, green: 0.2745, blue: 0.898, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.9:1). */
    public static let indigo700 = Color(.sRGB, red: 0.2627, green: 0.2196, blue: 0.7922, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.9:1). */
    public static let indigo800 = Color(.sRGB, red: 0.2157, green: 0.1882, blue: 0.6392, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (11.4:1). */
    public static let indigo900 = Color(.sRGB, red: 0.1922, green: 0.1804, blue: 0.5059, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (16.0:1). */
    public static let indigo950 = Color(.sRGB, red: 0.1176, green: 0.1059, blue: 0.2941, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    public static let violet50 = Color(.sRGB, red: 0.9608, green: 0.9529, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.7:1). */
    public static let violet100 = Color(.sRGB, red: 0.9294, green: 0.9137, blue: 0.9961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.1:1). */
    public static let violet200 = Color(.sRGB, red: 0.8667, green: 0.8392, blue: 0.9961, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.4:1). */
    public static let violet300 = Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.7:1). */
    public static let violet400 = Color(.sRGB, red: 0.6549, green: 0.5451, blue: 0.9804, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.2:1); black 5.0:1. */
    public static let violet500 = Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.7:1). */
    public static let violet600 = Color(.sRGB, red: 0.4863, green: 0.2275, blue: 0.9294, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    public static let violet700 = Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.0:1). */
    public static let violet800 = Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (11.0:1). */
    public static let violet900 = Color(.sRGB, red: 0.298, green: 0.1137, blue: 0.5843, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    public static let violet950 = Color(.sRGB, red: 0.1804, green: 0.0627, blue: 0.3961, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    public static let purple50 = Color(.sRGB, red: 0.9804, green: 0.9608, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.8:1). */
    public static let purple100 = Color(.sRGB, red: 0.9529, green: 0.9098, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.4:1). */
    public static let purple200 = Color(.sRGB, red: 0.9137, green: 0.8353, blue: 1, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.9:1). */
    public static let purple300 = Color(.sRGB, red: 0.8471, green: 0.7059, blue: 0.9961, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.9:1). */
    public static let purple400 = Color(.sRGB, red: 0.7529, green: 0.5176, blue: 0.9882, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.0:1); black 5.3:1. */
    public static let purple500 = Color(.sRGB, red: 0.6588, green: 0.3333, blue: 0.9686, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.4:1). */
    public static let purple600 = Color(.sRGB, red: 0.5765, green: 0.2, blue: 0.9176, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.0:1). */
    public static let purple700 = Color(.sRGB, red: 0.4941, green: 0.1333, blue: 0.8078, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    public static let purple800 = Color(.sRGB, red: 0.4196, green: 0.1294, blue: 0.6588, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.9:1). */
    public static let purple900 = Color(.sRGB, red: 0.3451, green: 0.1098, blue: 0.5294, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    public static let purple950 = Color(.sRGB, red: 0.2314, green: 0.0275, blue: 0.3922, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    public static let fuchsia50 = Color(.sRGB, red: 0.9922, green: 0.9569, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.1:1). */
    public static let fuchsia100 = Color(.sRGB, red: 0.9804, green: 0.9098, blue: 1, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.3:1). */
    public static let fuchsia200 = Color(.sRGB, red: 0.9608, green: 0.8157, blue: 0.9961, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.9:1). */
    public static let fuchsia300 = Color(.sRGB, red: 0.9412, green: 0.6706, blue: 0.9882, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.5:1). */
    public static let fuchsia400 = Color(.sRGB, red: 0.9098, green: 0.4745, blue: 0.9765, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.5:1); black 6.1:1. */
    public static let fuchsia500 = Color(.sRGB, red: 0.851, green: 0.2745, blue: 0.9373, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    public static let fuchsia600 = Color(.sRGB, red: 0.7529, green: 0.149, blue: 0.8275, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.3:1). */
    public static let fuchsia700 = Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.2:1). */
    public static let fuchsia800 = Color(.sRGB, red: 0.5255, green: 0.098, blue: 0.5608, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (10.0:1). */
    public static let fuchsia900 = Color(.sRGB, red: 0.4392, green: 0.102, blue: 0.4588, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (14.8:1). */
    public static let fuchsia950 = Color(.sRGB, red: 0.2902, green: 0.0157, blue: 0.3059, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    public static let pink50 = Color(.sRGB, red: 0.9922, green: 0.949, blue: 0.9725, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.9:1). */
    public static let pink100 = Color(.sRGB, red: 0.9882, green: 0.9059, blue: 0.9529, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.2:1). */
    public static let pink200 = Color(.sRGB, red: 0.9843, green: 0.8118, blue: 0.9098, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    public static let pink300 = Color(.sRGB, red: 0.9765, green: 0.6588, blue: 0.8314, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.9:1). */
    public static let pink400 = Color(.sRGB, red: 0.9569, green: 0.4471, blue: 0.7137, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.5:1); black 6.0:1. */
    public static let pink500 = Color(.sRGB, red: 0.9255, green: 0.2824, blue: 0.6, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.6:1). */
    public static let pink600 = Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.0:1). */
    public static let pink700 = Color(.sRGB, red: 0.7451, green: 0.0941, blue: 0.3647, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (7.9:1). */
    public static let pink800 = Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.6:1). */
    public static let pink900 = Color(.sRGB, red: 0.5137, green: 0.0941, blue: 0.2627, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    public static let pink950 = Color(.sRGB, red: 0.3137, green: 0.0275, blue: 0.1412, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    public static let rose50 = Color(.sRGB, red: 1, green: 0.9451, blue: 0.949, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.5:1). */
    public static let rose100 = Color(.sRGB, red: 1, green: 0.8941, blue: 0.902, opacity: 1)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.9:1). */
    public static let rose200 = Color(.sRGB, red: 0.9961, green: 0.8039, blue: 0.8275, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.1:1). */
    public static let rose300 = Color(.sRGB, red: 0.9922, green: 0.6431, blue: 0.6863, opacity: 1)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.8:1). */
    public static let rose400 = Color(.sRGB, red: 0.9843, green: 0.4431, blue: 0.5216, opacity: 1)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    public static let rose500 = Color(.sRGB, red: 0.9569, green: 0.2471, blue: 0.3686, opacity: 1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    public static let rose600 = Color(.sRGB, red: 0.8824, green: 0.1137, blue: 0.2824, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (6.3:1). */
    public static let rose700 = Color(.sRGB, red: 0.7451, green: 0.0706, blue: 0.2353, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (8.0:1). */
    public static let rose800 = Color(.sRGB, red: 0.6235, green: 0.0706, blue: 0.2235, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (9.6:1). */
    public static let rose900 = Color(.sRGB, red: 0.5333, green: 0.0745, blue: 0.2157, opacity: 1)
    /** Text, dark surfaces. Text: white passes on it (15.6:1). */
    public static let rose950 = Color(.sRGB, red: 0.298, green: 0.0196, blue: 0.098, opacity: 1)
}

/// The alias colors, one set per theme: SerupaColors.amberDark.primary.
public struct SerupaColors {
    /** Alias. Brand color: primary buttons, links, selected states. Light themes: brand 600 or 700, the lightest with 4.5:1 for white text on it and for it on the tints (`primary-subtle` and the status ones), with white text; dark themes: brand 400 with brand-950 text. More contrast: brand 800 / brand 300, 7:1+ on `surface` and `primary-subtle`. */
    public let primary: Color
    /** Alias. Hover / pressed state of `primary` (one step darker in light themes, lighter in dark). More contrast: brand 900 / brand 200. */
    public let primaryHover: Color
    /** Alias. Pressed state of `primary`: one step past `primary-hover` (darker in light themes, lighter in dark), so a held primary button reads as held without a shrink. More contrast: one step past its more-contrast hover where the scale goes on. */
    public let primaryPressed: Color
    /** Alias. Brand tint for selected rows and badges (brand 50 light, brand 950 dark). */
    public let primarySubtle: Color
    /** Alias. Pressed state of a fill in `primary-subtle` (a secondary button held down): one step past it (brand 100 light, brand 900 dark). `primary-hover` keeps 4.5:1 on it. */
    public let primarySubtlePressed: Color
    /** Alias. Text and icons on `primary` fills (white in light themes, brand 950 in dark). */
    public let onPrimary: Color
    /** Alias. Secondary button fill; hover fill for outline and ghost buttons. */
    public let secondary: Color
    /** Alias. Hover state of `secondary`. */
    public let secondaryHover: Color
    /** Alias. Pressed state of `secondary`, a step past `secondary-hover` (`pressed` is the same gray as `secondary-hover` in dark). */
    public let secondaryPressed: Color
    /** The keyboard-highlighted item in a list: Menu items, Combobox and TimePicker options, the Sidebar's current page. In light the same zinc-100 as `secondary` (about 1.1:1 on `surface`); in dark it shares `secondary`'s zinc-700 (1.7:1 on `surface`, 1.4:1 on `surface-overlay`), with no bar by default (`highlight-indicator`). Text on it keeps 4.5:1. */
    public let highlight: Color
    /** Alias. The fill while a row, tab, day or page button is held down (`:active`): one step past its hover. `text` keeps 7:1+ on it. */
    public let pressed: Color
    /** Alias. Card, panel and bar background (white light, zinc-900 dark). The page behind them is `surface-page`. */
    public let surface: Color
    /** Alias. The page itself: the <html> and <body> background, and a data-mode or data-theme section's. White in light, as `surface`; in dark zinc-950, a step below the zinc-900 cards, panels and bars on it, so they and every control (fields, buttons, SegmentedControl's track) sit lighter than the page. */
    public let surfacePage: Color
    /** Alias. Secondary panels, sidebars, table headers, filled Cards and wells: recessed, so a step below `surface` in both modes (zinc-50 under white in light, zinc-950 under zinc-900 in dark). A recess, so never the fill of something you press: controls use `surface-control`. */
    public let surfaceMuted: Color
    /** Alias. The fill of a control that is its own surface rather than a field: SegmentedControl's track, FileUpload's drop zone. zinc-50 in light, as `surface-muted`; in dark a step above the zinc-950 page (zinc-900), so a control is never darker than the surface it sits on. */
    public let surfaceControl: Color
    /** Alias. A row or item on `surface` under the pointer, a selected row, a striped row (List, Table, InlineEdit): a step off `surface` in every theme (zinc-100 light, the same as `highlight`; zinc-800 dark). Grey text on it reads `text-muted-shaded`. */
    public let surfaceHover: Color
    /** Alias. A List or InlineEdit row under the pointer or selected on a raised or floating surface (an elevated Card, a Popover, Dialog or Drawer): zinc-100 in light; in dark a step above zinc-800, halfway to zinc-700, where muted text keeps 4.5:1. Grey text on it reads `text-muted-shaded`. */
    public let surfaceHoverRaised: Color
    /** Alias. A raised card (Card `elevated`). One step up from `surface` in dark, where a shadow doesn't show. */
    public let surfaceRaised: Color
    /** Alias. Anything in the top layer: Menu, Popover, Dialog, Drawer, Toast and the Combobox, DatePicker and TimePicker lists. */
    public let surfaceOverlay: Color
    /** Alias. Background of text inputs, selects and other form fields: white in light, zinc-800 in dark, a fill that sets a field apart from the page and cards around it. */
    public let field: Color
    /** Alias. Background of a read-only or disabled form field: a step flatter than `field` (zinc-50 in light, zinc-900 in dark), so it reads as not editable while its `field-border` still outlines it. */
    public let fieldReadonly: Color
    /** Alias. The text, icon and mark of anything disabled, in place of fading it: the same neutral in every brand, so a disabled primary, danger or brand control reads as off, never as a faint version of itself. At least 3:1 on `disabled-surface` and the surfaces (4.5:1 with more contrast). */
    public let disabledText: Color
    /** Alias. The fill of a disabled control that has one (a checked box, a switch's track, a slider's fill, the selected segment): a neutral a step off the page, whatever its color when on. */
    public let disabledSurface: Color
    /** Alias. The edge of a disabled control: a box, a track, a field's border. */
    public let disabledBorder: Color
    /** The 2px bar at the start of the highlighted item in a dropdown list: Menu items, and Combobox, Select, TimePicker, MentionInput and CommandPalette options. By default it is the same color as `highlight` in every theme (change both together), so no bar shows and the grey fill alone marks the item: under the 3:1 WCAG 1.4.11 asks, a deliberate design choice, as with `field-border`. The item is also the one the screen reader names and the one Enter picks. More contrast (`data-contrast="more"` or the system setting) turns the bar `text`-dark, 3:1+ on `highlight`, and forced colors outline the item in `Highlight`. */
    public let highlightIndicator: Color
    /** Alias. Border of form fields (Input, Textarea, Select, Combobox, the pickers, Checkbox, Radio, PinInput) and SegmentedControl's track: a soft line, zinc-300 in light and zinc-700 in dark, a step lighter than the zinc-800 field. It is under the 3:1 WCAG 1.4.11 asks of a control's boundary, a deliberate design choice: the field also shows by its label above it, and in dark by its zinc-800 fill, hover and focus are stronger, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. Other controls' edges use `border-control`. */
    public let fieldBorder: Color
    /** Alias. Field border on hover: the resting `field-border` one gray step stronger (zinc-400 in light, zinc-600 in dark), so the field answers the pointer without taking the accent, which stays for focus. */
    public let fieldBorderHover: Color
    /** Alias. Field border while held down (Checkbox's box, Radio's circle): `field-border-hover` one gray step stronger again (zinc-500 in light, zinc-500 in dark). */
    public let fieldBorderPressed: Color
    /** Alias. The 3:1 edge of a control that isn't a text or choice field: Slider's track, Switch's track, Progress and Meter's track edge, Carousel's dots, ColorPicker's swatch edge, Stepper's ring and line, Rating's empty stars, Kbd, Splitter, ScrollArea's thumb and Avatar's offline dot. 3:1+ against `surface` in every theme (WCAG 1.4.11). */
    public let borderControl: Color
    /** Alias. `border-control` on hover, one step stronger (Switch's track). */
    public let borderControlHover: Color
    /** Alias. `border-control` while held down, one step past `border-control-hover` (Switch's track). */
    public let borderControlPressed: Color
    /** Alias. The fill of a button inside a field under the pointer (a calendar or clock button, Input's icon action, NumberInput's steppers, the country button): `secondary` in light, zinc-700 in dark, a step past the zinc-800 field. */
    public let fieldHover: Color
    /** Alias. The fill of a button inside a field while it's held down, one step past `field-hover` (zinc-200 in light, zinc-600 in dark; text keeps 4.5:1 on it). */
    public let fieldPressed: Color
    /** Alias. `field` on a raised or floating surface (Dialog, Drawer, Popover, an elevated Card, a bg-surface-raised or bg-surface-overlay panel), which set `--field` to it: white in light; in dark a step above the zinc-800 overlay (#333338, as `surface-hover-raised`), so a field in a dialog still stands out from it instead of matching it. `field-hover` and `field-pressed` already sit a step past it. */
    public let fieldRaised: Color
    /** Alias. An invalid field's border: `danger` (red 600), 3:1+ on `field` and `surface`. Its own alias so a theme whose field fill is lighter can take a lighter red. */
    public let fieldBorderInvalid: Color
    /** Alias. A text action inside a field (Input's "Apply"): `primary`, which keeps 4.5:1 on the field. Its own alias so a brand whose primary falls short on the field can take a lighter shade. */
    public let fieldAction: Color
    /** Alias. Placeholder text in form fields, and the other muted text inside a field: a prefix or suffix, a character count, the Caps Lock hint (4.5:1+ on `field` and `field-readonly`). Placeholders are hints, never labels. */
    public let placeholder: Color
    /** Alias. The dimmed backdrop behind dialogs and drawers (zinc-900 at 50% in light themes, zinc-950 at 70% in dark). */
    public let overlay: Color
    /** Alias. A hairline just inside a photo's edge (Image, Avatar), so a picture with a white or black background keeps its shape on a page of the same color: black at 10% in light themes, white at 10% in dark. */
    public let pictureEdge: Color
    /** Alias. Contrasting blocks: tooltips, inverse banners. */
    public let surfaceInverse: Color
    /** Alias. Body text and headings on `surface`. */
    public let text: Color
    /** Alias. Secondary text, captions, placeholders (4.5:1+ on `surface` in every theme). */
    public let textMuted: Color
    /** Alias. Secondary text inside a shaded row (`surface-hover`, `surface-hover-raised`: hovered, selected or striped), where `text-muted` would fall under 4.5:1 on zinc-100: zinc-600 in light, `text-muted`'s zinc-400 in dark. 4.5:1+ on either fill in every theme. */
    public let textMutedShaded: Color
    /** Alias. Text on `surface-inverse`. */
    public let textInverse: Color
    /** Alias. Default borders and dividers: zinc-200 in light; zinc-800 in dark, a step off the zinc-900 cards and bars it outlines. A quiet line, never a control's boundary: those use `field-border` or `border-control`. */
    public let border: Color
    /** Alias. Emphasised dividers and outlines. Form fields use `field-border`, which meets the 3:1 a control boundary needs. */
    public let borderStrong: Color
    /** Alias. The edge of a top-layer surface. In dark it is one step stronger than `border`, so a menu stands off the page. */
    public let borderOverlay: Color
    /** Alias. Keyboard focus outline, in the brand hue (3:1+ on `surface` in every theme). More contrast: brand 700 / brand 300. */
    public let focusRing: Color
    /** Alias. Success icons and fills (3:1). For success text use `success-text`. */
    public let success: Color
    /** Alias. Success alert / badge background. */
    public let successSubtle: Color
    /** Alias. Success text on `surface`, `surface-muted` and `success-subtle` (4.5:1+ in every theme). */
    public let successText: Color
    /** Alias. Hover / pressed state of `success` fills; `on-success` stays 4.5:1+ on it. */
    public let successHover: Color
    /** Alias. Text and icons on `success` fills (4.5:1+ in every theme). */
    public let onSuccess: Color
    /** Alias. Hover fill of an interactive `success-subtle` surface; `success-text` stays 4.5:1+ on it. */
    public let successSubtleHover: Color
    /** Alias. Border of a success outline control or callout. */
    public let successBorder: Color
    /** Alias. Warning icons and fills; put dark text on it. For warning text use `warning-text`. */
    public let warning: Color
    /** Alias. Warning alert / badge background. */
    public let warningSubtle: Color
    /** Alias. Warning text on `surface`, `surface-muted` and `warning-subtle` (4.5:1+ in every theme). */
    public let warningText: Color
    /** Alias. Hover / pressed state of `warning` fills; `on-warning` stays 4.5:1+ on it. */
    public let warningHover: Color
    /** Alias. Text and icons on `warning` fills (4.5:1+ in every theme). */
    public let onWarning: Color
    /** Alias. Hover fill of an interactive `warning-subtle` surface; `warning-text` stays 4.5:1+ on it. */
    public let warningSubtleHover: Color
    /** Alias. Border of a warning outline control or callout. */
    public let warningBorder: Color
    /** Alias. Errors, destructive buttons; white text on it (4.8:1). For error text on dark surfaces use `red-400`. */
    public let danger: Color
    /** Alias. Hover / pressed state of `danger`. */
    public let dangerHover: Color
    /** Alias. Pressed state of `danger`: one step past `danger-hover`; `on-danger` keeps 4.5:1 on it. */
    public let dangerPressed: Color
    /** Alias. Text and icons on `danger` fills. */
    public let onDanger: Color
    /** Alias. Error alert / badge background. */
    public let dangerSubtle: Color
    /** Alias. Destructive text and icons on `surface`, `danger-subtle` and its hover (5.3:1+ in every theme). */
    public let dangerText: Color
    /** Alias. Hover fill for destructive secondary, outline and ghost buttons. */
    public let dangerSubtleHover: Color
    /** Alias. Border of a destructive outline button. */
    public let dangerBorder: Color
    /** Alias. Informational icons and text. */
    public let info: Color
    /** Alias. Info alert / badge background. */
    public let infoSubtle: Color
    /** Alias. Info text on `surface`, `surface-muted` and `info-subtle` (4.5:1+ in every theme). */
    public let infoText: Color
    /** Alias. Hover / pressed state of `info` fills; `on-info` stays 4.5:1+ on it. */
    public let infoHover: Color
    /** Alias. Text and icons on `info` fills (4.5:1+ in every theme). */
    public let onInfo: Color
    /** Alias. Hover fill of an interactive `info-subtle` surface; `info-text` stays 4.5:1+ on it. */
    public let infoSubtleHover: Color
    /** Alias. Border of a info outline control or callout. */
    public let infoBorder: Color
    /** Alias. A visited link in reading content (Prose): a shade apart from primary, 4.5:1+ on `surface` and `surface-muted` in every theme. */
    public let linkVisited: Color
    /** Alias. Chart series 1 (blue): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart1: Color
    /** Alias. Chart series 2 (orange): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart2: Color
    /** Alias. Chart series 3 (pink): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart3: Color
    /** Alias. Chart series 4 (cyan): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart4: Color
    /** Alias. Chart series 5 (brown): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart5: Color
    /** Alias. Chart series 6 (teal): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart6: Color
    /** Alias. Chart series 7 (violet): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart7: Color
    /** Alias. Chart series 8 (red): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public let chart8: Color
    /** Alias. Sequential ramp, step 1 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public let chartSeq1: Color
    /** Alias. Sequential ramp, step 2 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public let chartSeq2: Color
    /** Alias. Sequential ramp, step 3 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public let chartSeq3: Color
    /** Alias. Sequential ramp, step 4 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public let chartSeq4: Color
    /** Alias. Sequential ramp, step 5 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before, and the last is 3:1+. */
    public let chartSeq5: Color
    /** Alias. Diverging ramp, step 1 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    public let chartDiv1: Color
    /** Alias. Diverging ramp, step 2 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public let chartDiv2: Color
    /** Alias. Diverging ramp, step 3 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public let chartDiv3: Color
    /** Alias. Diverging ramp, step 4 of 7 (the middle, no change): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public let chartDiv4: Color
    /** Alias. Diverging ramp, step 5 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public let chartDiv5: Color
    /** Alias. Diverging ramp, step 6 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public let chartDiv6: Color
    /** Alias. Diverging ramp, step 7 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    public let chartDiv7: Color
    /** Alias. Chart grid lines: quiet, behind the data. */
    public let chartGrid: Color
    /** Alias. Chart axis lines and ticks (3:1+ on `surface` in every theme). */
    public let chartAxis: Color
    /** Alias. Chart axis labels, values and legend text (4.5:1+ on `surface` and `surface-raised` in every theme). */
    public let chartLabel: Color
    /** Alias. The gap drawn between neighboring bars, slices and areas, so each one has 3:1+ against what touches it (WCAG 1.4.11). The page color: set it to the card's on a raised surface. */
    public let chartGap: Color

    public static let amberDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9922, green: 0.902, blue: 0.5412, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let amberLight = SerupaColors(
        primary: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        primarySubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let blueDark = SerupaColors(
        primary: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.1176, green: 0.2275, blue: 0.5412, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let blueLight = SerupaColors(
        primary: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9373, green: 0.9647, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let cyanDark = SerupaColors(
        primary: Color(.sRGB, red: 0.1333, green: 0.8275, blue: 0.9333, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.4039, green: 0.9098, blue: 0.9765, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.6471, green: 0.9529, blue: 0.9882, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0314, green: 0.2, blue: 0.2667, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.0863, green: 0.3059, blue: 0.3882, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0314, green: 0.2, blue: 0.2667, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.1333, green: 0.8275, blue: 0.9333, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.1333, green: 0.8275, blue: 0.9333, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let cyanLight = SerupaColors(
        primary: Color(.sRGB, red: 0.0549, green: 0.4549, blue: 0.5647, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.0824, green: 0.3686, blue: 0.4588, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.0863, green: 0.3059, blue: 0.3882, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9255, green: 0.9961, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8118, green: 0.9804, blue: 0.9961, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.0549, green: 0.4549, blue: 0.5647, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let emeraldDark = SerupaColors(
        primary: Color(.sRGB, red: 0.2039, green: 0.8275, blue: 0.6, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.4314, green: 0.9059, blue: 0.7176, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.6549, green: 0.9529, blue: 0.8157, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0078, green: 0.1725, blue: 0.1333, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.0235, green: 0.3059, blue: 0.2314, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0078, green: 0.1725, blue: 0.1333, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.2039, green: 0.8275, blue: 0.6, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.2039, green: 0.8275, blue: 0.6, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let emeraldLight = SerupaColors(
        primary: Color(.sRGB, red: 0.0157, green: 0.4706, blue: 0.3412, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.0235, green: 0.3725, blue: 0.2745, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.0235, green: 0.3059, blue: 0.2314, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9255, green: 0.9922, blue: 0.9608, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8196, green: 0.9804, blue: 0.898, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.0157, green: 0.4706, blue: 0.3412, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.0196, green: 0.5882, blue: 0.4118, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let fuchsiaDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9098, green: 0.4745, blue: 0.9765, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9412, green: 0.6706, blue: 0.9882, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9608, green: 0.8157, blue: 0.9961, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2902, green: 0.0157, blue: 0.3059, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.4392, green: 0.102, blue: 0.4588, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2902, green: 0.0157, blue: 0.3059, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9098, green: 0.4745, blue: 0.9765, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9098, green: 0.4745, blue: 0.9765, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let fuchsiaLight = SerupaColors(
        primary: Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.5255, green: 0.098, blue: 0.5608, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.4392, green: 0.102, blue: 0.4588, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9922, green: 0.9569, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9804, green: 0.9098, blue: 1, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.851, green: 0.2745, blue: 0.9373, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let greenDark = SerupaColors(
        primary: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.7333, green: 0.9686, blue: 0.8157, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let greenLight = SerupaColors(
        primary: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let indigoDark = SerupaColors(
        primary: Color(.sRGB, red: 0.5059, green: 0.549, blue: 0.9725, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.6471, green: 0.7059, blue: 0.9882, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.7804, green: 0.8235, blue: 0.9961, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.1176, green: 0.1059, blue: 0.2941, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.1922, green: 0.1804, blue: 0.5059, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.1176, green: 0.1059, blue: 0.2941, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.5059, green: 0.549, blue: 0.9725, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.5059, green: 0.549, blue: 0.9725, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.9412, green: 0.6706, blue: 0.9882, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let indigoLight = SerupaColors(
        primary: Color(.sRGB, red: 0.3098, green: 0.2745, blue: 0.898, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.2627, green: 0.2196, blue: 0.7922, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.2157, green: 0.1882, blue: 0.6392, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9333, green: 0.949, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8784, green: 0.9059, blue: 1, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.3098, green: 0.2745, blue: 0.898, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.3882, green: 0.4, blue: 0.9451, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let limeDark = SerupaColors(
        primary: Color(.sRGB, red: 0.6392, green: 0.902, blue: 0.2078, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.7451, green: 0.949, blue: 0.3922, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.851, green: 0.9765, blue: 0.6157, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.102, green: 0.1804, blue: 0.0196, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.2118, green: 0.3255, blue: 0.0784, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.102, green: 0.1804, blue: 0.0196, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.6392, green: 0.902, blue: 0.2078, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.6392, green: 0.902, blue: 0.2078, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let limeLight = SerupaColors(
        primary: Color(.sRGB, red: 0.302, green: 0.4863, blue: 0.0588, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.2471, green: 0.3843, blue: 0.0706, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.2118, green: 0.3255, blue: 0.0784, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9686, green: 0.9961, blue: 0.9059, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9255, green: 0.9882, blue: 0.7961, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.302, green: 0.4863, blue: 0.0588, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.302, green: 0.4863, blue: 0.0588, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let orangeDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9843, green: 0.5725, blue: 0.2353, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9922, green: 0.7294, blue: 0.4549, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9961, green: 0.8431, blue: 0.6667, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2627, green: 0.0784, blue: 0.0275, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.4863, green: 0.1765, blue: 0.0706, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2627, green: 0.0784, blue: 0.0275, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9843, green: 0.5725, blue: 0.2353, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9843, green: 0.5725, blue: 0.2353, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let orangeLight = SerupaColors(
        primary: Color(.sRGB, red: 0.7608, green: 0.2549, blue: 0.0471, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.6039, green: 0.2039, blue: 0.0706, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.4863, green: 0.1765, blue: 0.0706, opacity: 1),
        primarySubtle: Color(.sRGB, red: 1, green: 0.9686, blue: 0.9294, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 1, green: 0.9294, blue: 0.8353, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7608, green: 0.2549, blue: 0.0471, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let pinkDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9569, green: 0.4471, blue: 0.7137, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9765, green: 0.6588, blue: 0.8314, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9843, green: 0.8118, blue: 0.9098, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.3137, green: 0.0275, blue: 0.1412, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.5137, green: 0.0941, blue: 0.2627, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.3137, green: 0.0275, blue: 0.1412, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9569, green: 0.4471, blue: 0.7137, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9569, green: 0.4471, blue: 0.7137, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let pinkLight = SerupaColors(
        primary: Color(.sRGB, red: 0.7451, green: 0.0941, blue: 0.3647, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.5137, green: 0.0941, blue: 0.2627, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9922, green: 0.949, blue: 0.9725, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9882, green: 0.9059, blue: 0.9529, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7451, green: 0.0941, blue: 0.3647, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9255, green: 0.2824, blue: 0.6, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let purpleDark = SerupaColors(
        primary: Color(.sRGB, red: 0.7529, green: 0.5176, blue: 0.9882, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.8471, green: 0.7059, blue: 0.9961, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9137, green: 0.8353, blue: 1, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2314, green: 0.0275, blue: 0.3922, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.3451, green: 0.1098, blue: 0.5294, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2314, green: 0.0275, blue: 0.3922, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7529, green: 0.5176, blue: 0.9882, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.7529, green: 0.5176, blue: 0.9882, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.9412, green: 0.6706, blue: 0.9882, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let purpleLight = SerupaColors(
        primary: Color(.sRGB, red: 0.5765, green: 0.2, blue: 0.9176, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.4941, green: 0.1333, blue: 0.8078, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.4196, green: 0.1294, blue: 0.6588, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9804, green: 0.9608, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9529, green: 0.9098, blue: 1, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.5765, green: 0.2, blue: 0.9176, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.6588, green: 0.3333, blue: 0.9686, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let redDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9725, green: 0.4431, blue: 0.4431, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9725, green: 0.4431, blue: 0.4431, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9725, green: 0.4431, blue: 0.4431, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let redLight = SerupaColors(
        primary: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let roseDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9843, green: 0.4431, blue: 0.5216, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9922, green: 0.6431, blue: 0.6863, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9961, green: 0.8039, blue: 0.8275, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.298, green: 0.0196, blue: 0.098, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.5333, green: 0.0745, blue: 0.2157, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.298, green: 0.0196, blue: 0.098, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9843, green: 0.4431, blue: 0.5216, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9843, green: 0.4431, blue: 0.5216, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let roseLight = SerupaColors(
        primary: Color(.sRGB, red: 0.7451, green: 0.0706, blue: 0.2353, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.6235, green: 0.0706, blue: 0.2235, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.5333, green: 0.0745, blue: 0.2157, opacity: 1),
        primarySubtle: Color(.sRGB, red: 1, green: 0.9451, blue: 0.949, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 1, green: 0.8941, blue: 0.902, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.7451, green: 0.0706, blue: 0.2353, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9569, green: 0.2471, blue: 0.3686, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let skyDark = SerupaColors(
        primary: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.7294, green: 0.902, blue: 0.9922, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let skyLight = SerupaColors(
        primary: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.0078, green: 0.5176, blue: 0.7804, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let tealDark = SerupaColors(
        primary: Color(.sRGB, red: 0.1765, green: 0.8314, blue: 0.749, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.3686, green: 0.9176, blue: 0.8314, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.6, green: 0.9647, blue: 0.8941, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.0157, green: 0.1843, blue: 0.1804, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.0745, green: 0.3059, blue: 0.2902, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.0157, green: 0.1843, blue: 0.1804, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.1765, green: 0.8314, blue: 0.749, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.1765, green: 0.8314, blue: 0.749, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let tealLight = SerupaColors(
        primary: Color(.sRGB, red: 0.0588, green: 0.4627, blue: 0.4314, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.0667, green: 0.3686, blue: 0.349, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.0745, green: 0.3059, blue: 0.2902, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9804, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.8, green: 0.9843, blue: 0.9451, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.0588, green: 0.4627, blue: 0.4314, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let violetDark = SerupaColors(
        primary: Color(.sRGB, red: 0.6549, green: 0.5451, blue: 0.9804, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.8667, green: 0.8392, blue: 0.9961, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.1804, green: 0.0627, blue: 0.3961, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.298, green: 0.1137, blue: 0.5843, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.1804, green: 0.0627, blue: 0.3961, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.6549, green: 0.5451, blue: 0.9804, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.6549, green: 0.5451, blue: 0.9804, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.9412, green: 0.6706, blue: 0.9882, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let violetLight = SerupaColors(
        primary: Color(.sRGB, red: 0.4863, green: 0.2275, blue: 0.9294, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9608, green: 0.9529, blue: 1, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9294, green: 0.9137, blue: 0.9961, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.4863, green: 0.2275, blue: 0.9294, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.6353, green: 0.1098, blue: 0.6863, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )

    public static let yellowDark = SerupaColors(
        primary: Color(.sRGB, red: 0.9804, green: 0.8, blue: 0.0824, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.9922, green: 0.8784, blue: 0.2784, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.9961, green: 0.9412, blue: 0.5412, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.2588, green: 0.1255, blue: 0.0235, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.4431, green: 0.2471, blue: 0.0706, opacity: 1),
        onPrimary: Color(.sRGB, red: 0.2588, green: 0.1255, blue: 0.0235, opacity: 1),
        secondary: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        highlight: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        pressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        surface: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfacePage: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        field: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        disabledText: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        fieldRaised: Color(.sRGB, red: 0.2, green: 0.2, blue: 0.2196, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.9804, green: 0.8, blue: 0.0824, opacity: 1),
        placeholder: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        overlay: Color(.sRGB, red: 0.0353, green: 0.0353, blue: 0.0431, opacity: 0.702),
        pictureEdge: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        text: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        textMuted: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        textInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        border: Color(.sRGB, red: 0.1529, green: 0.1529, blue: 0.1647, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        focusRing: Color(.sRGB, red: 0.9804, green: 0.8, blue: 0.0824, opacity: 1),
        success: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successText: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        successHover: Color(.sRGB, red: 0.2902, green: 0.8706, blue: 0.502, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.0784, green: 0.3255, blue: 0.1765, opacity: 1),
        successBorder: Color(.sRGB, red: 0.0863, green: 0.3961, blue: 0.2039, opacity: 1),
        warning: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        warningSubtle: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningText: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9843, green: 0.749, blue: 0.1412, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.4706, green: 0.2078, blue: 0.0588, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.5725, green: 0.251, blue: 0.0549, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.2706, green: 0.0392, blue: 0.0392, opacity: 1),
        dangerText: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.498, green: 0.1137, blue: 0.1137, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        info: Color(.sRGB, red: 0.2196, green: 0.7412, blue: 0.9725, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoText: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        infoHover: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        onInfo: Color(.sRGB, red: 0.0314, green: 0.1843, blue: 0.2863, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.0471, green: 0.2902, blue: 0.4314, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.7686, green: 0.7098, blue: 0.9922, opacity: 1),
        chart1: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chart2: Color(.sRGB, red: 0.9765, green: 0.451, blue: 0.0863, opacity: 1),
        chart3: Color(.sRGB, red: 0.8588, green: 0.1529, blue: 0.4667, opacity: 1),
        chart4: Color(.sRGB, red: 0.0235, green: 0.7137, blue: 0.8314, opacity: 1),
        chart5: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.5451, green: 0.3608, blue: 0.9647, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.8588, green: 0.9176, blue: 0.9961, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.5765, green: 0.7725, blue: 0.9922, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        chartGap: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1)
    )

    public static let yellowLight = SerupaColors(
        primary: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        primaryHover: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        primaryPressed: Color(.sRGB, red: 0.4431, green: 0.2471, blue: 0.0706, opacity: 1),
        primarySubtle: Color(.sRGB, red: 0.9961, green: 0.9882, blue: 0.9098, opacity: 1),
        primarySubtlePressed: Color(.sRGB, red: 0.9961, green: 0.9765, blue: 0.7647, opacity: 1),
        onPrimary: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        secondary: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        secondaryHover: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        secondaryPressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlight: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        pressed: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        surface: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfacePage: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceMuted: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceControl: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        surfaceHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceHoverRaised: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        surfaceRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        surfaceOverlay: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        field: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldReadonly: Color(.sRGB, red: 0.9804, green: 0.9804, blue: 0.9804, opacity: 1),
        disabledText: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        disabledSurface: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        disabledBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        highlightIndicator: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldBorder: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        fieldBorderHover: Color(.sRGB, red: 0.6314, green: 0.6314, blue: 0.6667, opacity: 1),
        fieldBorderPressed: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControl: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        borderControlHover: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        borderControlPressed: Color(.sRGB, red: 0.2471, green: 0.2471, blue: 0.2745, opacity: 1),
        fieldHover: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        fieldPressed: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        fieldRaised: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        fieldBorderInvalid: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        fieldAction: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        placeholder: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        overlay: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 0.502),
        pictureEdge: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.102),
        surfaceInverse: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        text: Color(.sRGB, red: 0.0941, green: 0.0941, blue: 0.1059, opacity: 1),
        textMuted: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        textMutedShaded: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        textInverse: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        border: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        borderStrong: Color(.sRGB, red: 0.8314, green: 0.8314, blue: 0.8471, opacity: 1),
        borderOverlay: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        focusRing: Color(.sRGB, red: 0.6314, green: 0.3843, blue: 0.0275, opacity: 1),
        success: Color(.sRGB, red: 0.0863, green: 0.6392, blue: 0.2902, opacity: 1),
        successSubtle: Color(.sRGB, red: 0.9412, green: 0.9922, blue: 0.9569, opacity: 1),
        successText: Color(.sRGB, red: 0.0824, green: 0.502, blue: 0.2392, opacity: 1),
        successHover: Color(.sRGB, red: 0.1333, green: 0.7725, blue: 0.3686, opacity: 1),
        onSuccess: Color(.sRGB, red: 0.0196, green: 0.1804, blue: 0.0863, opacity: 1),
        successSubtleHover: Color(.sRGB, red: 0.8627, green: 0.9882, blue: 0.9059, opacity: 1),
        successBorder: Color(.sRGB, red: 0.5255, green: 0.9373, blue: 0.6745, opacity: 1),
        warning: Color(.sRGB, red: 0.851, green: 0.4667, blue: 0.0235, opacity: 1),
        warningSubtle: Color(.sRGB, red: 1, green: 0.9843, blue: 0.9216, opacity: 1),
        warningText: Color(.sRGB, red: 0.7059, green: 0.3255, blue: 0.0353, opacity: 1),
        warningHover: Color(.sRGB, red: 0.9608, green: 0.6196, blue: 0.0431, opacity: 1),
        onWarning: Color(.sRGB, red: 0.2706, green: 0.102, blue: 0.0118, opacity: 1),
        warningSubtleHover: Color(.sRGB, red: 0.9961, green: 0.9529, blue: 0.7804, opacity: 1),
        warningBorder: Color(.sRGB, red: 0.9882, green: 0.8275, blue: 0.302, opacity: 1),
        danger: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        dangerHover: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerPressed: Color(.sRGB, red: 0.6, green: 0.1059, blue: 0.1059, opacity: 1),
        onDanger: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        dangerSubtle: Color(.sRGB, red: 0.9961, green: 0.949, blue: 0.949, opacity: 1),
        dangerText: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        dangerSubtleHover: Color(.sRGB, red: 0.9961, green: 0.8863, blue: 0.8863, opacity: 1),
        dangerBorder: Color(.sRGB, red: 0.9882, green: 0.6471, blue: 0.6471, opacity: 1),
        info: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoSubtle: Color(.sRGB, red: 0.9412, green: 0.9765, blue: 1, opacity: 1),
        infoText: Color(.sRGB, red: 0.0118, green: 0.4118, blue: 0.6314, opacity: 1),
        infoHover: Color(.sRGB, red: 0.0275, green: 0.349, blue: 0.5216, opacity: 1),
        onInfo: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1),
        infoSubtleHover: Color(.sRGB, red: 0.8784, green: 0.949, blue: 0.9961, opacity: 1),
        infoBorder: Color(.sRGB, red: 0.4902, green: 0.8275, blue: 0.9882, opacity: 1),
        linkVisited: Color(.sRGB, red: 0.4275, green: 0.1569, blue: 0.851, opacity: 1),
        chart1: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chart2: Color(.sRGB, red: 0.9176, green: 0.3451, blue: 0.0471, opacity: 1),
        chart3: Color(.sRGB, red: 0.6157, green: 0.0902, blue: 0.302, opacity: 1),
        chart4: Color(.sRGB, red: 0.0314, green: 0.5686, blue: 0.698, opacity: 1),
        chart5: Color(.sRGB, red: 0.5216, green: 0.302, blue: 0.0549, opacity: 1),
        chart6: Color(.sRGB, red: 0.051, green: 0.5804, blue: 0.5333, opacity: 1),
        chart7: Color(.sRGB, red: 0.3569, green: 0.1294, blue: 0.7137, opacity: 1),
        chart8: Color(.sRGB, red: 0.8627, green: 0.149, blue: 0.149, opacity: 1),
        chartSeq1: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartSeq2: Color(.sRGB, red: 0.3765, green: 0.6471, blue: 0.9804, opacity: 1),
        chartSeq3: Color(.sRGB, red: 0.1451, green: 0.3882, blue: 0.9216, opacity: 1),
        chartSeq4: Color(.sRGB, red: 0.1176, green: 0.251, blue: 0.6863, opacity: 1),
        chartSeq5: Color(.sRGB, red: 0.0902, green: 0.1451, blue: 0.3294, opacity: 1),
        chartDiv1: Color(.sRGB, red: 0.7255, green: 0.1098, blue: 0.1098, opacity: 1),
        chartDiv2: Color(.sRGB, red: 0.9373, green: 0.2667, blue: 0.2667, opacity: 1),
        chartDiv3: Color(.sRGB, red: 0.9961, green: 0.7922, blue: 0.7922, opacity: 1),
        chartDiv4: Color(.sRGB, red: 0.9569, green: 0.9569, blue: 0.9608, opacity: 1),
        chartDiv5: Color(.sRGB, red: 0.749, green: 0.8588, blue: 0.9961, opacity: 1),
        chartDiv6: Color(.sRGB, red: 0.2314, green: 0.5098, blue: 0.9647, opacity: 1),
        chartDiv7: Color(.sRGB, red: 0.1137, green: 0.3059, blue: 0.8471, opacity: 1),
        chartGrid: Color(.sRGB, red: 0.8941, green: 0.8941, blue: 0.9059, opacity: 1),
        chartAxis: Color(.sRGB, red: 0.4431, green: 0.4431, blue: 0.4784, opacity: 1),
        chartLabel: Color(.sRGB, red: 0.3216, green: 0.3216, blue: 0.3569, opacity: 1),
        chartGap: Color(.sRGB, red: 1, green: 1, blue: 1, opacity: 1)
    )
}

/// The alias colors from SerupaColors.xcassets (in the release's native archive), a brand's light and dark in one
/// color, so the system picks by the appearance: SerupaAssetColors(brand: "amber").primary.
public struct SerupaAssetColors {
    public let brand: String
    public let bundle: Bundle?
    public init(brand: String, bundle: Bundle? = nil) { self.brand = brand; self.bundle = bundle }
    /** Alias. Brand color: primary buttons, links, selected states. Light themes: brand 600 or 700, the lightest with 4.5:1 for white text on it and for it on the tints (`primary-subtle` and the status ones), with white text; dark themes: brand 400 with brand-950 text. More contrast: brand 800 / brand 300, 7:1+ on `surface` and `primary-subtle`. */
    public var primary: Color { Color("\(brand)/primary", bundle: bundle) }
    /** Alias. Hover / pressed state of `primary` (one step darker in light themes, lighter in dark). More contrast: brand 900 / brand 200. */
    public var primaryHover: Color { Color("\(brand)/primary-hover", bundle: bundle) }
    /** Alias. Pressed state of `primary`: one step past `primary-hover` (darker in light themes, lighter in dark), so a held primary button reads as held without a shrink. More contrast: one step past its more-contrast hover where the scale goes on. */
    public var primaryPressed: Color { Color("\(brand)/primary-pressed", bundle: bundle) }
    /** Alias. Brand tint for selected rows and badges (brand 50 light, brand 950 dark). */
    public var primarySubtle: Color { Color("\(brand)/primary-subtle", bundle: bundle) }
    /** Alias. Pressed state of a fill in `primary-subtle` (a secondary button held down): one step past it (brand 100 light, brand 900 dark). `primary-hover` keeps 4.5:1 on it. */
    public var primarySubtlePressed: Color { Color("\(brand)/primary-subtle-pressed", bundle: bundle) }
    /** Alias. Text and icons on `primary` fills (white in light themes, brand 950 in dark). */
    public var onPrimary: Color { Color("\(brand)/on-primary", bundle: bundle) }
    /** Alias. Secondary button fill; hover fill for outline and ghost buttons. */
    public var secondary: Color { Color("\(brand)/secondary", bundle: bundle) }
    /** Alias. Hover state of `secondary`. */
    public var secondaryHover: Color { Color("\(brand)/secondary-hover", bundle: bundle) }
    /** Alias. Pressed state of `secondary`, a step past `secondary-hover` (`pressed` is the same gray as `secondary-hover` in dark). */
    public var secondaryPressed: Color { Color("\(brand)/secondary-pressed", bundle: bundle) }
    /** The keyboard-highlighted item in a list: Menu items, Combobox and TimePicker options, the Sidebar's current page. In light the same zinc-100 as `secondary` (about 1.1:1 on `surface`); in dark it shares `secondary`'s zinc-700 (1.7:1 on `surface`, 1.4:1 on `surface-overlay`), with no bar by default (`highlight-indicator`). Text on it keeps 4.5:1. */
    public var highlight: Color { Color("\(brand)/highlight", bundle: bundle) }
    /** Alias. The fill while a row, tab, day or page button is held down (`:active`): one step past its hover. `text` keeps 7:1+ on it. */
    public var pressed: Color { Color("\(brand)/pressed", bundle: bundle) }
    /** Alias. Card, panel and bar background (white light, zinc-900 dark). The page behind them is `surface-page`. */
    public var surface: Color { Color("\(brand)/surface", bundle: bundle) }
    /** Alias. The page itself: the <html> and <body> background, and a data-mode or data-theme section's. White in light, as `surface`; in dark zinc-950, a step below the zinc-900 cards, panels and bars on it, so they and every control (fields, buttons, SegmentedControl's track) sit lighter than the page. */
    public var surfacePage: Color { Color("\(brand)/surface-page", bundle: bundle) }
    /** Alias. Secondary panels, sidebars, table headers, filled Cards and wells: recessed, so a step below `surface` in both modes (zinc-50 under white in light, zinc-950 under zinc-900 in dark). A recess, so never the fill of something you press: controls use `surface-control`. */
    public var surfaceMuted: Color { Color("\(brand)/surface-muted", bundle: bundle) }
    /** Alias. The fill of a control that is its own surface rather than a field: SegmentedControl's track, FileUpload's drop zone. zinc-50 in light, as `surface-muted`; in dark a step above the zinc-950 page (zinc-900), so a control is never darker than the surface it sits on. */
    public var surfaceControl: Color { Color("\(brand)/surface-control", bundle: bundle) }
    /** Alias. A row or item on `surface` under the pointer, a selected row, a striped row (List, Table, InlineEdit): a step off `surface` in every theme (zinc-100 light, the same as `highlight`; zinc-800 dark). Grey text on it reads `text-muted-shaded`. */
    public var surfaceHover: Color { Color("\(brand)/surface-hover", bundle: bundle) }
    /** Alias. A List or InlineEdit row under the pointer or selected on a raised or floating surface (an elevated Card, a Popover, Dialog or Drawer): zinc-100 in light; in dark a step above zinc-800, halfway to zinc-700, where muted text keeps 4.5:1. Grey text on it reads `text-muted-shaded`. */
    public var surfaceHoverRaised: Color { Color("\(brand)/surface-hover-raised", bundle: bundle) }
    /** Alias. A raised card (Card `elevated`). One step up from `surface` in dark, where a shadow doesn't show. */
    public var surfaceRaised: Color { Color("\(brand)/surface-raised", bundle: bundle) }
    /** Alias. Anything in the top layer: Menu, Popover, Dialog, Drawer, Toast and the Combobox, DatePicker and TimePicker lists. */
    public var surfaceOverlay: Color { Color("\(brand)/surface-overlay", bundle: bundle) }
    /** Alias. Background of text inputs, selects and other form fields: white in light, zinc-800 in dark, a fill that sets a field apart from the page and cards around it. */
    public var field: Color { Color("\(brand)/field", bundle: bundle) }
    /** Alias. Background of a read-only or disabled form field: a step flatter than `field` (zinc-50 in light, zinc-900 in dark), so it reads as not editable while its `field-border` still outlines it. */
    public var fieldReadonly: Color { Color("\(brand)/field-readonly", bundle: bundle) }
    /** Alias. The text, icon and mark of anything disabled, in place of fading it: the same neutral in every brand, so a disabled primary, danger or brand control reads as off, never as a faint version of itself. At least 3:1 on `disabled-surface` and the surfaces (4.5:1 with more contrast). */
    public var disabledText: Color { Color("\(brand)/disabled-text", bundle: bundle) }
    /** Alias. The fill of a disabled control that has one (a checked box, a switch's track, a slider's fill, the selected segment): a neutral a step off the page, whatever its color when on. */
    public var disabledSurface: Color { Color("\(brand)/disabled-surface", bundle: bundle) }
    /** Alias. The edge of a disabled control: a box, a track, a field's border. */
    public var disabledBorder: Color { Color("\(brand)/disabled-border", bundle: bundle) }
    /** The 2px bar at the start of the highlighted item in a dropdown list: Menu items, and Combobox, Select, TimePicker, MentionInput and CommandPalette options. By default it is the same color as `highlight` in every theme (change both together), so no bar shows and the grey fill alone marks the item: under the 3:1 WCAG 1.4.11 asks, a deliberate design choice, as with `field-border`. The item is also the one the screen reader names and the one Enter picks. More contrast (`data-contrast="more"` or the system setting) turns the bar `text`-dark, 3:1+ on `highlight`, and forced colors outline the item in `Highlight`. */
    public var highlightIndicator: Color { Color("\(brand)/highlight-indicator", bundle: bundle) }
    /** Alias. Border of form fields (Input, Textarea, Select, Combobox, the pickers, Checkbox, Radio, PinInput) and SegmentedControl's track: a soft line, zinc-300 in light and zinc-700 in dark, a step lighter than the zinc-800 field. It is under the 3:1 WCAG 1.4.11 asks of a control's boundary, a deliberate design choice: the field also shows by its label above it, and in dark by its zinc-800 fill, hover and focus are stronger, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. Other controls' edges use `border-control`. */
    public var fieldBorder: Color { Color("\(brand)/field-border", bundle: bundle) }
    /** Alias. Field border on hover: the resting `field-border` one gray step stronger (zinc-400 in light, zinc-600 in dark), so the field answers the pointer without taking the accent, which stays for focus. */
    public var fieldBorderHover: Color { Color("\(brand)/field-border-hover", bundle: bundle) }
    /** Alias. Field border while held down (Checkbox's box, Radio's circle): `field-border-hover` one gray step stronger again (zinc-500 in light, zinc-500 in dark). */
    public var fieldBorderPressed: Color { Color("\(brand)/field-border-pressed", bundle: bundle) }
    /** Alias. The 3:1 edge of a control that isn't a text or choice field: Slider's track, Switch's track, Progress and Meter's track edge, Carousel's dots, ColorPicker's swatch edge, Stepper's ring and line, Rating's empty stars, Kbd, Splitter, ScrollArea's thumb and Avatar's offline dot. 3:1+ against `surface` in every theme (WCAG 1.4.11). */
    public var borderControl: Color { Color("\(brand)/border-control", bundle: bundle) }
    /** Alias. `border-control` on hover, one step stronger (Switch's track). */
    public var borderControlHover: Color { Color("\(brand)/border-control-hover", bundle: bundle) }
    /** Alias. `border-control` while held down, one step past `border-control-hover` (Switch's track). */
    public var borderControlPressed: Color { Color("\(brand)/border-control-pressed", bundle: bundle) }
    /** Alias. The fill of a button inside a field under the pointer (a calendar or clock button, Input's icon action, NumberInput's steppers, the country button): `secondary` in light, zinc-700 in dark, a step past the zinc-800 field. */
    public var fieldHover: Color { Color("\(brand)/field-hover", bundle: bundle) }
    /** Alias. The fill of a button inside a field while it's held down, one step past `field-hover` (zinc-200 in light, zinc-600 in dark; text keeps 4.5:1 on it). */
    public var fieldPressed: Color { Color("\(brand)/field-pressed", bundle: bundle) }
    /** Alias. `field` on a raised or floating surface (Dialog, Drawer, Popover, an elevated Card, a bg-surface-raised or bg-surface-overlay panel), which set `--field` to it: white in light; in dark a step above the zinc-800 overlay (#333338, as `surface-hover-raised`), so a field in a dialog still stands out from it instead of matching it. `field-hover` and `field-pressed` already sit a step past it. */
    public var fieldRaised: Color { Color("\(brand)/field-raised", bundle: bundle) }
    /** Alias. An invalid field's border: `danger` (red 600), 3:1+ on `field` and `surface`. Its own alias so a theme whose field fill is lighter can take a lighter red. */
    public var fieldBorderInvalid: Color { Color("\(brand)/field-border-invalid", bundle: bundle) }
    /** Alias. A text action inside a field (Input's "Apply"): `primary`, which keeps 4.5:1 on the field. Its own alias so a brand whose primary falls short on the field can take a lighter shade. */
    public var fieldAction: Color { Color("\(brand)/field-action", bundle: bundle) }
    /** Alias. Placeholder text in form fields, and the other muted text inside a field: a prefix or suffix, a character count, the Caps Lock hint (4.5:1+ on `field` and `field-readonly`). Placeholders are hints, never labels. */
    public var placeholder: Color { Color("\(brand)/placeholder", bundle: bundle) }
    /** Alias. The dimmed backdrop behind dialogs and drawers (zinc-900 at 50% in light themes, zinc-950 at 70% in dark). */
    public var overlay: Color { Color("\(brand)/overlay", bundle: bundle) }
    /** Alias. A hairline just inside a photo's edge (Image, Avatar), so a picture with a white or black background keeps its shape on a page of the same color: black at 10% in light themes, white at 10% in dark. */
    public var pictureEdge: Color { Color("\(brand)/picture-edge", bundle: bundle) }
    /** Alias. Contrasting blocks: tooltips, inverse banners. */
    public var surfaceInverse: Color { Color("\(brand)/surface-inverse", bundle: bundle) }
    /** Alias. Body text and headings on `surface`. */
    public var text: Color { Color("\(brand)/text", bundle: bundle) }
    /** Alias. Secondary text, captions, placeholders (4.5:1+ on `surface` in every theme). */
    public var textMuted: Color { Color("\(brand)/text-muted", bundle: bundle) }
    /** Alias. Secondary text inside a shaded row (`surface-hover`, `surface-hover-raised`: hovered, selected or striped), where `text-muted` would fall under 4.5:1 on zinc-100: zinc-600 in light, `text-muted`'s zinc-400 in dark. 4.5:1+ on either fill in every theme. */
    public var textMutedShaded: Color { Color("\(brand)/text-muted-shaded", bundle: bundle) }
    /** Alias. Text on `surface-inverse`. */
    public var textInverse: Color { Color("\(brand)/text-inverse", bundle: bundle) }
    /** Alias. Default borders and dividers: zinc-200 in light; zinc-800 in dark, a step off the zinc-900 cards and bars it outlines. A quiet line, never a control's boundary: those use `field-border` or `border-control`. */
    public var border: Color { Color("\(brand)/border", bundle: bundle) }
    /** Alias. Emphasised dividers and outlines. Form fields use `field-border`, which meets the 3:1 a control boundary needs. */
    public var borderStrong: Color { Color("\(brand)/border-strong", bundle: bundle) }
    /** Alias. The edge of a top-layer surface. In dark it is one step stronger than `border`, so a menu stands off the page. */
    public var borderOverlay: Color { Color("\(brand)/border-overlay", bundle: bundle) }
    /** Alias. Keyboard focus outline, in the brand hue (3:1+ on `surface` in every theme). More contrast: brand 700 / brand 300. */
    public var focusRing: Color { Color("\(brand)/focus-ring", bundle: bundle) }
    /** Alias. Success icons and fills (3:1). For success text use `success-text`. */
    public var success: Color { Color("\(brand)/success", bundle: bundle) }
    /** Alias. Success alert / badge background. */
    public var successSubtle: Color { Color("\(brand)/success-subtle", bundle: bundle) }
    /** Alias. Success text on `surface`, `surface-muted` and `success-subtle` (4.5:1+ in every theme). */
    public var successText: Color { Color("\(brand)/success-text", bundle: bundle) }
    /** Alias. Hover / pressed state of `success` fills; `on-success` stays 4.5:1+ on it. */
    public var successHover: Color { Color("\(brand)/success-hover", bundle: bundle) }
    /** Alias. Text and icons on `success` fills (4.5:1+ in every theme). */
    public var onSuccess: Color { Color("\(brand)/on-success", bundle: bundle) }
    /** Alias. Hover fill of an interactive `success-subtle` surface; `success-text` stays 4.5:1+ on it. */
    public var successSubtleHover: Color { Color("\(brand)/success-subtle-hover", bundle: bundle) }
    /** Alias. Border of a success outline control or callout. */
    public var successBorder: Color { Color("\(brand)/success-border", bundle: bundle) }
    /** Alias. Warning icons and fills; put dark text on it. For warning text use `warning-text`. */
    public var warning: Color { Color("\(brand)/warning", bundle: bundle) }
    /** Alias. Warning alert / badge background. */
    public var warningSubtle: Color { Color("\(brand)/warning-subtle", bundle: bundle) }
    /** Alias. Warning text on `surface`, `surface-muted` and `warning-subtle` (4.5:1+ in every theme). */
    public var warningText: Color { Color("\(brand)/warning-text", bundle: bundle) }
    /** Alias. Hover / pressed state of `warning` fills; `on-warning` stays 4.5:1+ on it. */
    public var warningHover: Color { Color("\(brand)/warning-hover", bundle: bundle) }
    /** Alias. Text and icons on `warning` fills (4.5:1+ in every theme). */
    public var onWarning: Color { Color("\(brand)/on-warning", bundle: bundle) }
    /** Alias. Hover fill of an interactive `warning-subtle` surface; `warning-text` stays 4.5:1+ on it. */
    public var warningSubtleHover: Color { Color("\(brand)/warning-subtle-hover", bundle: bundle) }
    /** Alias. Border of a warning outline control or callout. */
    public var warningBorder: Color { Color("\(brand)/warning-border", bundle: bundle) }
    /** Alias. Errors, destructive buttons; white text on it (4.8:1). For error text on dark surfaces use `red-400`. */
    public var danger: Color { Color("\(brand)/danger", bundle: bundle) }
    /** Alias. Hover / pressed state of `danger`. */
    public var dangerHover: Color { Color("\(brand)/danger-hover", bundle: bundle) }
    /** Alias. Pressed state of `danger`: one step past `danger-hover`; `on-danger` keeps 4.5:1 on it. */
    public var dangerPressed: Color { Color("\(brand)/danger-pressed", bundle: bundle) }
    /** Alias. Text and icons on `danger` fills. */
    public var onDanger: Color { Color("\(brand)/on-danger", bundle: bundle) }
    /** Alias. Error alert / badge background. */
    public var dangerSubtle: Color { Color("\(brand)/danger-subtle", bundle: bundle) }
    /** Alias. Destructive text and icons on `surface`, `danger-subtle` and its hover (5.3:1+ in every theme). */
    public var dangerText: Color { Color("\(brand)/danger-text", bundle: bundle) }
    /** Alias. Hover fill for destructive secondary, outline and ghost buttons. */
    public var dangerSubtleHover: Color { Color("\(brand)/danger-subtle-hover", bundle: bundle) }
    /** Alias. Border of a destructive outline button. */
    public var dangerBorder: Color { Color("\(brand)/danger-border", bundle: bundle) }
    /** Alias. Informational icons and text. */
    public var info: Color { Color("\(brand)/info", bundle: bundle) }
    /** Alias. Info alert / badge background. */
    public var infoSubtle: Color { Color("\(brand)/info-subtle", bundle: bundle) }
    /** Alias. Info text on `surface`, `surface-muted` and `info-subtle` (4.5:1+ in every theme). */
    public var infoText: Color { Color("\(brand)/info-text", bundle: bundle) }
    /** Alias. Hover / pressed state of `info` fills; `on-info` stays 4.5:1+ on it. */
    public var infoHover: Color { Color("\(brand)/info-hover", bundle: bundle) }
    /** Alias. Text and icons on `info` fills (4.5:1+ in every theme). */
    public var onInfo: Color { Color("\(brand)/on-info", bundle: bundle) }
    /** Alias. Hover fill of an interactive `info-subtle` surface; `info-text` stays 4.5:1+ on it. */
    public var infoSubtleHover: Color { Color("\(brand)/info-subtle-hover", bundle: bundle) }
    /** Alias. Border of a info outline control or callout. */
    public var infoBorder: Color { Color("\(brand)/info-border", bundle: bundle) }
    /** Alias. A visited link in reading content (Prose): a shade apart from primary, 4.5:1+ on `surface` and `surface-muted` in every theme. */
    public var linkVisited: Color { Color("\(brand)/link-visited", bundle: bundle) }
    /** Alias. Chart series 1 (blue): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart1: Color { Color("\(brand)/chart-1", bundle: bundle) }
    /** Alias. Chart series 2 (orange): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart2: Color { Color("\(brand)/chart-2", bundle: bundle) }
    /** Alias. Chart series 3 (pink): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart3: Color { Color("\(brand)/chart-3", bundle: bundle) }
    /** Alias. Chart series 4 (cyan): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart4: Color { Color("\(brand)/chart-4", bundle: bundle) }
    /** Alias. Chart series 5 (brown): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart5: Color { Color("\(brand)/chart-5", bundle: bundle) }
    /** Alias. Chart series 6 (teal): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart6: Color { Color("\(brand)/chart-6", bundle: bundle) }
    /** Alias. Chart series 7 (violet): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart7: Color { Color("\(brand)/chart-7", bundle: bundle) }
    /** Alias. Chart series 8 (red): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    public var chart8: Color { Color("\(brand)/chart-8", bundle: bundle) }
    /** Alias. Sequential ramp, step 1 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public var chartSeq1: Color { Color("\(brand)/chart-seq-1", bundle: bundle) }
    /** Alias. Sequential ramp, step 2 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public var chartSeq2: Color { Color("\(brand)/chart-seq-2", bundle: bundle) }
    /** Alias. Sequential ramp, step 3 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public var chartSeq3: Color { Color("\(brand)/chart-seq-3", bundle: bundle) }
    /** Alias. Sequential ramp, step 4 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    public var chartSeq4: Color { Color("\(brand)/chart-seq-4", bundle: bundle) }
    /** Alias. Sequential ramp, step 5 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before, and the last is 3:1+. */
    public var chartSeq5: Color { Color("\(brand)/chart-seq-5", bundle: bundle) }
    /** Alias. Diverging ramp, step 1 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    public var chartDiv1: Color { Color("\(brand)/chart-div-1", bundle: bundle) }
    /** Alias. Diverging ramp, step 2 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public var chartDiv2: Color { Color("\(brand)/chart-div-2", bundle: bundle) }
    /** Alias. Diverging ramp, step 3 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public var chartDiv3: Color { Color("\(brand)/chart-div-3", bundle: bundle) }
    /** Alias. Diverging ramp, step 4 of 7 (the middle, no change): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public var chartDiv4: Color { Color("\(brand)/chart-div-4", bundle: bundle) }
    /** Alias. Diverging ramp, step 5 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public var chartDiv5: Color { Color("\(brand)/chart-div-5", bundle: bundle) }
    /** Alias. Diverging ramp, step 6 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    public var chartDiv6: Color { Color("\(brand)/chart-div-6", bundle: bundle) }
    /** Alias. Diverging ramp, step 7 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    public var chartDiv7: Color { Color("\(brand)/chart-div-7", bundle: bundle) }
    /** Alias. Chart grid lines: quiet, behind the data. */
    public var chartGrid: Color { Color("\(brand)/chart-grid", bundle: bundle) }
    /** Alias. Chart axis lines and ticks (3:1+ on `surface` in every theme). */
    public var chartAxis: Color { Color("\(brand)/chart-axis", bundle: bundle) }
    /** Alias. Chart axis labels, values and legend text (4.5:1+ on `surface` and `surface-raised` in every theme). */
    public var chartLabel: Color { Color("\(brand)/chart-label", bundle: bundle) }
    /** Alias. The gap drawn between neighboring bars, slices and areas, so each one has 3:1+ against what touches it (WCAG 1.4.11). The page color: set it to the card's on a raised surface. */
    public var chartGap: Color { Color("\(brand)/chart-gap", bundle: bundle) }
}

/// An easing curve, CSS's cubic-bezier(): .animation(SerupaEasing.easeEnter.animation(duration: SerupaTokens.duration150)).
public struct SerupaEasing {
    public let x1: Double, y1: Double, x2: Double, y2: Double
    public func animation(duration: TimeInterval) -> Animation { .timingCurve(x1, y1, x2, y2, duration: duration) }

    /** Constant speed: spinners, progress bars. */
    public static let easeLinear = SerupaEasing(x1: 0, y1: 0, x2: 1, y2: 1)
    /** Something appearing: quick off the mark, then a long smooth landing. */
    public static let easeEnter = SerupaEasing(x1: 0.25, y1: 1, x2: 0.5, y2: 1)
    /** Something leaving: at full speed from the first frame, then easing off as it fades, so a closed surface is out of the way at once. An ease-in starts slowly, and the first frames after a close are the ones people watch. */
    public static let easeExit = SerupaEasing(x1: 0.25, y1: 1, x2: 0.5, y2: 1)
    /** Something that stays on screen and changes: a thumb sliding, a panel resizing, a color changing. A smooth start and finish. */
    public static let easeMove = SerupaEasing(x1: 0.65, y1: 0, x2: 0.35, y2: 1)
    /** Something arriving at a new value or let go by the hand: a fill, a slide, a drawer dropped. Most of the travel at once, then a long glide to rest. */
    public static let easeSettle = SerupaEasing(x1: 0.16, y1: 1, x2: 0.3, y2: 1)
    /** Something small popping into place: a check mark, a count, a dot. Overshoots a touch, then settles. */
    public static let easePop = SerupaEasing(x1: 0.34, y1: 1.36, x2: 0.64, y2: 1)
    /** Something the hand let go of mid-motion carrying on to rest: a drawer or carousel slide flicked. It starts at three times its average speed, so a settle timed as 3 × distance ÷ the hand’s speed starts exactly at that speed and slows from there (`settleTime()` in the components). */
    public static let easeFling = SerupaEasing(x1: 0.33, y1: 1, x2: 0.68, y2: 1)
}

/// A drop shadow, layer by layer as CSS draws it, in points: view.serupaShadow(SerupaShadow.elevationRaised). SwiftUI's
/// radius is half the CSS blur; it has no spread, so a layer's spread is kept for drawing it yourself.
public struct SerupaShadow {
    public struct Layer {
        public let color: Color
        public let x: CGFloat, y: CGFloat, blur: CGFloat, spread: CGFloat
        public var radius: CGFloat { blur / 2 }
    }
    public let layers: [Layer]

    /** `shadow-2xs`. Hairline lift under flat controls. */
    public static let shadow2xs = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.05), x: 0, y: 1, blur: 0, spread: 0)])
    /** `shadow-xs`. Buttons and inputs (Button uses it). */
    public static let shadowXs = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.05), x: 0, y: 1, blur: 2, spread: 0)])
    /** `shadow-sm`. Cards at rest. */
    public static let shadowSm = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 1, blur: 3, spread: 0), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 1, blur: 2, spread: -1)])
    /** `shadow-md`. Raised cards, hover states. */
    public static let shadowMd = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 4, blur: 6, spread: -1), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 2, blur: 4, spread: -2)])
    /** `shadow-lg`. Dropdowns, popovers. */
    public static let shadowLg = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 10, blur: 15, spread: -3), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 4, blur: 6, spread: -4)])
    /** `shadow-xl`. Dialogs, floating panels. */
    public static let shadowXl = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 20, blur: 25, spread: -5), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 8, blur: 10, spread: -6)])
    /** `shadow-2xl`. Modals, the highest elevation. */
    public static let shadow2xl = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.25), x: 0, y: 25, blur: 50, spread: -12)])
    /** `shadow-none`. Removes a shadow. */
    public static let shadowNone = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0), x: 0, y: 0, blur: 0, spread: 0)])
    /** Level 1, resting: something sitting on the page with a hairline lift, such as an outline card. */
    public static let elevationRest = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.05), x: 0, y: 1, blur: 2, spread: 0)])
    /** A part raised over the control or content it sits on: a slider thumb, the indicator of a segmented control, carousel arrows, a table head once the rows scroll under it. */
    public static let elevationPart = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 1, blur: 3, spread: 0), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 1, blur: 2, spread: -1)])
    /** Level 2, raised: a card raised by hover or on purpose, an item being dragged, a navbar once the page scrolls under it, a tooltip. */
    public static let elevationRaised = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 4, blur: 6, spread: -1), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 2, blur: 4, spread: -2)])
    /** Level 3, floating: menus, popovers, list boxes, date and time pickers, hover cards, toasts, a floating action button. */
    public static let elevationOverlay = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 10, blur: 15, spread: -3), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 4, blur: 6, spread: -4)])
    /** Level 4, modal: dialogs and drawers, over the overlay backdrop. */
    public static let elevationModal = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 20, blur: 25, spread: -5), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: 8, blur: 10, spread: -6)])
    /** Level 4 for a panel against the bottom edge (a bottom sheet): `elevation-modal` cast upward, toward the page, from the same light. */
    public static let elevationModalUp = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: -20, blur: 25, spread: -5), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 0, y: -8, blur: 10, spread: -6)])
    /** Level 4 for a panel against the right edge: `elevation-modal` cast to the left, toward the page. */
    public static let elevationModalLeft = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: -20, y: 0, blur: 25, spread: -5), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: -8, y: 0, blur: 10, spread: -6)])
    /** Level 4 for a panel against the left edge: `elevation-modal` cast to the right, toward the page. */
    public static let elevationModalRight = SerupaShadow(layers: [Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 20, y: 0, blur: 25, spread: -5), Layer(color: Color(.sRGB, red: 0, green: 0, blue: 0, opacity: 0.1), x: 8, y: 0, blur: 10, spread: -6)])
}

public extension View {
    /// Draws each layer of a Serupa shadow, the first on top.
    func serupaShadow(_ shadow: SerupaShadow) -> some View {
        shadow.layers.reversed().reduce(AnyView(self)) { view, l in AnyView(view.shadow(color: l.color, radius: l.radius, x: l.x, y: l.y)) }
    }
}

/// A type style in points: the family (add the font to the app, or the system font stands in), size, line height
/// (the whole line, as CSS sets it), weight and tracking. Text(…).font(SerupaTypeStyle.typeHeading1.font).
public struct SerupaTypeStyle {
    public let family: String
    public let size: CGFloat, lineHeight: CGFloat
    public let weight: Font.Weight
    public let tracking: CGFloat
    public var font: Font { .custom(family, size: size).weight(weight) }
    /// The space between lines that makes up the line height with the font's own (about 1.2 times its size).
    public var lineSpacing: CGFloat { max(0, lineHeight - size * 1.2) }

    /** `type-xs`: the whole 12px style in one class (Inter 400, line height 1rem). Same size as `text-xs`. */
    public static let typeXs = SerupaTypeStyle(family: "Inter", size: 12, lineHeight: 16, weight: .regular, tracking: 0)
    /** `type-sm`: the whole 14px style in one class (Inter 400, line height 1.25rem). Same size as `text-sm`. */
    public static let typeSm = SerupaTypeStyle(family: "Inter", size: 14, lineHeight: 20, weight: .regular, tracking: 0)
    /** `type-base`: the whole 16px style in one class (Inter 400, line height 1.5rem). Same size as `text-base`. */
    public static let typeBase = SerupaTypeStyle(family: "Inter", size: 16, lineHeight: 24, weight: .regular, tracking: 0)
    /** `type-lg`: the whole 18px style in one class (Inter 400, line height 1.75rem). Same size as `text-lg`. */
    public static let typeLg = SerupaTypeStyle(family: "Inter", size: 18, lineHeight: 28, weight: .regular, tracking: 0)
    /** `type-xl`: the whole 20px style in one class (Inter 400, line height 1.75rem). Same size as `text-xl`. */
    public static let typeXl = SerupaTypeStyle(family: "Inter", size: 20, lineHeight: 28, weight: .regular, tracking: 0)
    /** `type-2xl`: the whole 24px style in one class (Inter 400, line height 2rem). Same size as `text-2xl`. */
    public static let type2xl = SerupaTypeStyle(family: "Inter", size: 24, lineHeight: 32, weight: .regular, tracking: 0)
    /** `type-3xl`: the whole 30px style in one class (Inter 400, line height 2.25rem). Same size as `text-3xl`. */
    public static let type3xl = SerupaTypeStyle(family: "Inter", size: 30, lineHeight: 36, weight: .regular, tracking: 0)
    /** `type-4xl`: the whole 36px style in one class (Inter 400, line height 2.5rem). Same size as `text-4xl`. */
    public static let type4xl = SerupaTypeStyle(family: "Inter", size: 36, lineHeight: 40, weight: .regular, tracking: 0)
    /** `type-5xl`: the whole 48px style in one class (Inter 400, line height 1). Same size as `text-5xl`. */
    public static let type5xl = SerupaTypeStyle(family: "Inter", size: 48, lineHeight: 48, weight: .regular, tracking: 0)
    /** `type-6xl`: the whole 60px style in one class (Inter 400, line height 1). Same size as `text-6xl`. */
    public static let type6xl = SerupaTypeStyle(family: "Inter", size: 60, lineHeight: 60, weight: .regular, tracking: 0)
    /** `type-7xl`: the whole 72px style in one class (Inter 400, line height 1). Same size as `text-7xl`. */
    public static let type7xl = SerupaTypeStyle(family: "Inter", size: 72, lineHeight: 72, weight: .regular, tracking: 0)
    /** `type-8xl`: the whole 96px style in one class (Inter 400, line height 1). Same size as `text-8xl`. */
    public static let type8xl = SerupaTypeStyle(family: "Inter", size: 96, lineHeight: 96, weight: .regular, tracking: 0)
    /** `type-9xl`: the whole 128px style in one class (Inter 400, line height 1). Same size as `text-9xl`. */
    public static let type9xl = SerupaTypeStyle(family: "Inter", size: 128, lineHeight: 128, weight: .regular, tracking: 0)
    /** `type-display`: hero and marketing headlines (48px, 600, tracked tight, on a 52px line so two lines don't touch). */
    public static let typeDisplay = SerupaTypeStyle(family: "Inter", size: 48, lineHeight: 52, weight: .semibold, tracking: 0)
    /** `type-heading-1`: a page title. What a level 1 `Heading` renders. */
    public static let typeHeading1 = SerupaTypeStyle(family: "Inter", size: 30, lineHeight: 36, weight: .semibold, tracking: 0)
    /** `type-heading-2`: a section title. What a level 2 `Heading` renders. */
    public static let typeHeading2 = SerupaTypeStyle(family: "Inter", size: 24, lineHeight: 32, weight: .semibold, tracking: 0)
    /** `type-heading-3`: a subsection title. What a level 3 `Heading` renders. */
    public static let typeHeading3 = SerupaTypeStyle(family: "Inter", size: 20, lineHeight: 28, weight: .semibold, tracking: 0)
    /** `type-heading-4`: a group title, and Dialog and Drawer titles. What a level 4 `Heading` renders. */
    public static let typeHeading4 = SerupaTypeStyle(family: "Inter", size: 18, lineHeight: 28, weight: .semibold, tracking: 0)
    /** `type-title`: a card or list title, and Card and EmptyState titles. */
    public static let typeTitle = SerupaTypeStyle(family: "Inter", size: 16, lineHeight: 24, weight: .semibold, tracking: 0)
    /** `type-body`: running text. */
    public static let typeBody = SerupaTypeStyle(family: "Inter", size: 16, lineHeight: 24, weight: .regular, tracking: 0)
    /** `type-body-sm`: UI text: controls, table cells, menus, descriptions. */
    public static let typeBodySm = SerupaTypeStyle(family: "Inter", size: 14, lineHeight: 20, weight: .regular, tracking: 0)
    /** `type-label`: a form label (Field), table headers, tabs. */
    public static let typeLabel = SerupaTypeStyle(family: "Inter", size: 14, lineHeight: 20, weight: .medium, tracking: 0)
    /** `type-caption`: hints, timestamps, footnotes. Pair with `text-muted`. */
    public static let typeCaption = SerupaTypeStyle(family: "Inter", size: 12, lineHeight: 16, weight: .regular, tracking: 0)
    /** `type-overline`: an eyebrow above a title. Uppercase and tracked widest. */
    public static let typeOverline = SerupaTypeStyle(family: "Inter", size: 12, lineHeight: 16, weight: .semibold, tracking: 0)
    /** `type-code`: inline code and code blocks, in `font-mono`. */
    public static let typeCode = SerupaTypeStyle(family: "ui-monospace", size: 14, lineHeight: 20, weight: .regular, tracking: 0)
}
