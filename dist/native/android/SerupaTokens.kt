// Serupa 17.0.0: design tokens for native apps, generated from design-tokens/ (tools/build/native-tokens.mjs). Don't edit.

package com.serupa.tokens

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** Sizes in dp (a rem is 16), font sizes in sp, durations in milliseconds, opacities from 0 to 1. */
object SerupaTokens {
    /** `0` (`p-0`, `m-0`, `gap-0`…): 0px. */
    val spacing0 = 0.dp
    /** `px` (`p-px`, `m-px`, `gap-px`…): 1px. */
    val spacingPx = 1.dp
    /** `0.5` (`p-0.5`, `m-0.5`, `gap-0.5`…): 2px. */
    val spacing0_5 = 2.dp
    /** `1` (`p-1`, `m-1`, `gap-1`…): 4px. Icon-to-label gaps. */
    val spacing1 = 4.dp
    /** `1.5` (`p-1.5`, `m-1.5`, `gap-1.5`…): 6px. */
    val spacing1_5 = 6.dp
    /** `2` (`p-2`, `m-2`, `gap-2`…): 8px. Tight gaps inside controls. */
    val spacing2 = 8.dp
    /** `2.5` (`p-2.5`, `m-2.5`, `gap-2.5`…): 10px. */
    val spacing2_5 = 10.dp
    /** `3` (`p-3`, `m-3`, `gap-3`…): 12px. */
    val spacing3 = 12.dp
    /** `3.5` (`p-3.5`, `m-3.5`, `gap-3.5`…): 14px. */
    val spacing3_5 = 14.dp
    /** `4` (`p-4`, `m-4`, `gap-4`…): 16px. Default padding and gaps. */
    val spacing4 = 16.dp
    /** `5` (`p-5`, `m-5`, `gap-5`…): 20px. */
    val spacing5 = 20.dp
    /** `6` (`p-6`, `m-6`, `gap-6`…): 24px. Dialog and drawer padding. */
    val spacing6 = 24.dp
    /** `7` (`p-7`, `m-7`, `gap-7`…): 28px. */
    val spacing7 = 28.dp
    /** `8` (`p-8`, `m-8`, `gap-8`…): 32px. Gaps between groups. */
    val spacing8 = 32.dp
    /** `9` (`p-9`, `m-9`, `gap-9`…): 36px. */
    val spacing9 = 36.dp
    /** `10` (`p-10`, `m-10`, `gap-10`…): 40px. */
    val spacing10 = 40.dp
    /** `11` (`p-11`, `m-11`, `gap-11`…): 44px. */
    val spacing11 = 44.dp
    /** `12` (`p-12`, `m-12`, `gap-12`…): 48px. Section spacing. */
    val spacing12 = 48.dp
    /** `14` (`p-14`, `m-14`, `gap-14`…): 56px. */
    val spacing14 = 56.dp
    /** `16` (`p-16`, `m-16`, `gap-16`…): 64px. Large section spacing. */
    val spacing16 = 64.dp
    /** `20` (`p-20`, `m-20`, `gap-20`…): 80px. */
    val spacing20 = 80.dp
    /** `24` (`p-24`, `m-24`, `gap-24`…): 96px. */
    val spacing24 = 96.dp
    /** `28` (`p-28`, `m-28`, `gap-28`…): 112px. */
    val spacing28 = 112.dp
    /** `32` (`p-32`, `m-32`, `gap-32`…): 128px. */
    val spacing32 = 128.dp
    /** `36` (`p-36`, `m-36`, `gap-36`…): 144px. */
    val spacing36 = 144.dp
    /** `40` (`p-40`, `m-40`, `gap-40`…): 160px. */
    val spacing40 = 160.dp
    /** `44` (`p-44`, `m-44`, `gap-44`…): 176px. */
    val spacing44 = 176.dp
    /** `48` (`p-48`, `m-48`, `gap-48`…): 192px. */
    val spacing48 = 192.dp
    /** `52` (`p-52`, `m-52`, `gap-52`…): 208px. */
    val spacing52 = 208.dp
    /** `56` (`p-56`, `m-56`, `gap-56`…): 224px. */
    val spacing56 = 224.dp
    /** `60` (`p-60`, `m-60`, `gap-60`…): 240px. */
    val spacing60 = 240.dp
    /** `64` (`p-64`, `m-64`, `gap-64`…): 256px. */
    val spacing64 = 256.dp
    /** `72` (`p-72`, `m-72`, `gap-72`…): 288px. */
    val spacing72 = 288.dp
    /** `80` (`p-80`, `m-80`, `gap-80`…): 320px. */
    val spacing80 = 320.dp
    /** `96` (`p-96`, `m-96`, `gap-96`…): 384px. */
    val spacing96 = 384.dp
    /** Between an icon and its label, or a mark and its text. 4px. */
    val spaceInline = 4.dp
    /** Between the parts of one control, or items that belong together: a field's label and input, buttons in a group. 8px. */
    val spaceRelated = 8.dp
    /** The default padding and gap: inside a popover, between fields of a form. Popover, HoverCard and Tour read it for their padding. 16px. */
    val spaceContent = 16.dp
    /** The padding of a dialog, a drawer or a large card (Card padding lg), which read it for theirs; Card's default (md) is 20px. 24px. */
    val spaceSurface = 24.dp
    /** Between the sections of a long-form or marketing page. 32px. */
    val spaceSection = 32.dp
    /** On an app screen: between the page header, the sections and the cards. 24px. */
    val spacePage = 24.dp
    /** On a long-form or marketing page: after the page header and between bands. 64px. */
    val spaceBand = 64.dp
    /** `rounded-none`: Square corners. */
    val roundedNone = 0.dp
    /** `rounded-xs`: 2px. Tags, small chips, focus outlines. */
    val roundedXs = 2.dp
    /** `rounded-sm`: 4px. Inputs, small buttons, checkboxes. */
    val roundedSm = 4.dp
    /** `rounded`: 4px. Same as `rounded-sm`; kept for older code. */
    val rounded = 4.dp
    /** `rounded-md`: 6px. Buttons, inputs (Button uses it). */
    val roundedMd = 6.dp
    /** `rounded-lg`: 8px. Cards, menus, popovers. */
    val roundedLg = 8.dp
    /** `rounded-xl`: 12px. Large cards, panels. */
    val roundedXl = 12.dp
    /** `rounded-2xl`: 16px. Modals, feature cards. */
    val rounded2xl = 16.dp
    /** `rounded-3xl`: 24px. Hero blocks, large surfaces. */
    val rounded3xl = 24.dp
    /** `rounded-4xl`: 32px. Very large surfaces, marketing blocks. */
    val rounded4xl = 32.dp
    /** `rounded-full`: Pills and circles: avatars, badges, toggles. */
    val roundedFull = 9999.dp
    /** A small part inside or beside a control: a checkbox, a key, a clear or stepper button, the indicator of a segmented control, the focus ring of a link in text, inline code. 4px. */
    val radiusInner = 4.dp
    /** A control or an item people press or type in: buttons, inputs, selects, tabs, badges, tooltips, and the items of a menu, list box, sidebar or tree. 6px. */
    val radiusControl = 6.dp
    /** A surface that holds content or floats over the page: alerts, tables, lists, accordions, drop zones, and menus, popovers, list boxes and toasts. 8px. */
    val radiusSurface = 8.dp
    /** A large container: cards, dialogs, drawers and carousels. 12px. */
    val radiusContainer = 12.dp
    /** A pill or a circle: tracks and thumbs, steps, round buttons and swatches. */
    val radiusPill = 9999.dp
    /** `border-0`. */
    val borderWidth0 = 0.dp
    /** `border-1` (`border`): the default hairline. */
    val borderWidth1 = 1.dp
    /** `border-2`. Focus and selected states. */
    val borderWidth2 = 2.dp
    /** `border-4`. */
    val borderWidth4 = 4.dp
    /** `border-8`. */
    val borderWidth8 = 8.dp
    /** `outline-0`. */
    val outlineWidth0 = 0.dp
    /** `outline-1` (`outline`). */
    val outlineWidth1 = 1.dp
    /** `outline-2`. Focus outlines. */
    val outlineWidth2 = 2.dp
    /** `outline-4`. */
    val outlineWidth4 = 4.dp
    /** `outline-8`. */
    val outlineWidth8 = 8.dp
    /** `outline-offset-0`. */
    val outlineOffset0 = 0.dp
    /** `outline-offset-1`. */
    val outlineOffset1 = 1.dp
    /** `outline-offset-2`. Gap between an element and its focus outline. */
    val outlineOffset2 = 2.dp
    /** `outline-offset-4`. */
    val outlineOffset4 = 4.dp
    /** `outline-offset-8`. */
    val outlineOffset8 = 8.dp
    /** The focus ring's width: `outline: var(--focus-ring-width) solid var(--focus-ring)`. Every component's focus ring uses it. A third thicker (3px) with more contrast. */
    val focusRingWidth = 2.dp
    /** The width of the bar that `highlight-indicator` colors on a current or selected item: Sidebar's current page, Navbar's current link, and the selected row of List, TreeView and Table. 0 by default, so no bar is drawn and the fill alone marks the item, whatever fill it has (hovered, pressed or a component's own). 2px with more contrast (`data-contrast="more"` or the system setting), where the bar is `text`-dark. */
    val highlightIndicatorWidth = 0.dp
    /** The transparent gap between an element and its focus ring (`outline-offset`). Inset rings, where an outline would be clipped, use 0. */
    val focusRingOffset = 2.dp
    /** 256px, used by `w-3xs`, `min-w-3xs`, `max-w-3xs`, `inline-3xs`, `min-inline-3xs`, `max-inline-3xs`. Narrow popovers, sidebars. */
    val container3xs = 256.dp
    /** 288px, used by `w-2xs`, `min-w-2xs`, `max-w-2xs`, `inline-2xs`, `min-inline-2xs`, `max-inline-2xs`. Sidebars, filter panels. */
    val container2xs = 288.dp
    /** 320px, used by `w-xs`, `min-w-xs`, `max-w-xs`, `inline-xs`, `min-inline-xs`, `max-inline-xs`. Small dialogs, popover cards. */
    val containerXs = 320.dp
    /** 384px, used by `w-sm`, `min-w-sm`, `max-w-sm`, `inline-sm`, `min-inline-sm`, `max-inline-sm`. Sign-in forms, narrow dialogs. */
    val containerSm = 384.dp
    /** 448px, used by `w-md`, `min-w-md`, `max-w-md`, `inline-md`, `min-inline-md`, `max-inline-md`. Standard dialogs. */
    val containerMd = 448.dp
    /** 512px, used by `w-lg`, `min-w-lg`, `max-w-lg`, `inline-lg`, `min-inline-lg`, `max-inline-lg`. Wide dialogs, forms. */
    val containerLg = 512.dp
    /** 576px, used by `w-xl`, `min-w-xl`, `max-w-xl`, `inline-xl`, `min-inline-xl`, `max-inline-xl`. Side panels, form pages. */
    val containerXl = 576.dp
    /** 672px, used by `w-2xl`, `min-w-2xl`, `max-w-2xl`, `inline-2xl`, `min-inline-2xl`, `max-inline-2xl`. Settings pages, long forms. */
    val container2xl = 672.dp
    /** 768px, used by `w-3xl`, `min-w-3xl`, `max-w-3xl`, `inline-3xl`, `min-inline-3xl`, `max-inline-3xl`. Article and document bodies with images. */
    val container3xl = 768.dp
    /** 896px, used by `w-4xl`, `min-w-4xl`, `max-w-4xl`, `inline-4xl`, `min-inline-4xl`, `max-inline-4xl`. Content pages. */
    val container4xl = 896.dp
    /** 1024px, used by `w-5xl`, `min-w-5xl`, `max-w-5xl`, `inline-5xl`, `min-inline-5xl`, `max-inline-5xl`. Dashboards with a sidebar. */
    val container5xl = 1024.dp
    /** 1152px, used by `w-6xl`, `min-w-6xl`, `max-w-6xl`, `inline-6xl`, `min-inline-6xl`, `max-inline-6xl`. Wide app layouts. */
    val container6xl = 1152.dp
    /** 1280px, used by `w-7xl`, `min-w-7xl`, `max-w-7xl`, `inline-7xl`, `min-inline-7xl`, `max-inline-7xl`. Marketing and full app shells. */
    val container7xl = 1280.dp
    /** One pixel: hairlines. */
    val sizingPx = 1.dp
    /** Height of small controls (24px): `sm` buttons, compact inputs. The WCAG 2.2 AA minimum target size. */
    val controlHeightSm = 24.dp
    /** Height of default controls (32px): buttons, inputs and selects line up at this height. */
    val controlHeightMd = 32.dp
    /** Height of large controls (44px), the comfortable touch target (WCAG 2.5.5). */
    val controlHeightLg = 44.dp
    /** `opacity-0`, `backdrop-opacity-0`. Hidden but still in the layout. */
    const val opacity0 = 0f
    /** `opacity-5`, `backdrop-opacity-5`. */
    const val opacity5 = 0.05f
    /** `opacity-10`, `backdrop-opacity-10`. */
    const val opacity10 = 0.1f
    /** `opacity-15`, `backdrop-opacity-15`. */
    const val opacity15 = 0.15f
    /** `opacity-20`, `backdrop-opacity-20`. */
    const val opacity20 = 0.2f
    /** `opacity-25`, `backdrop-opacity-25`. */
    const val opacity25 = 0.25f
    /** `opacity-30`, `backdrop-opacity-30`. */
    const val opacity30 = 0.3f
    /** `opacity-35`, `backdrop-opacity-35`. */
    const val opacity35 = 0.35f
    /** `opacity-40`, `backdrop-opacity-40`. */
    const val opacity40 = 0.4f
    /** `opacity-45`, `backdrop-opacity-45`. */
    const val opacity45 = 0.45f
    /** `opacity-50`, `backdrop-opacity-50`. For disabled controls use `opacity-disabled`. */
    const val opacity50 = 0.5f
    /** `opacity-55`, `backdrop-opacity-55`. */
    const val opacity55 = 0.55f
    /** `opacity-60`, `backdrop-opacity-60`. */
    const val opacity60 = 0.6f
    /** `opacity-65`, `backdrop-opacity-65`. */
    const val opacity65 = 0.65f
    /** `opacity-70`, `backdrop-opacity-70`. */
    const val opacity70 = 0.7f
    /** `opacity-75`, `backdrop-opacity-75`. */
    const val opacity75 = 0.75f
    /** `opacity-80`, `backdrop-opacity-80`. */
    const val opacity80 = 0.8f
    /** `opacity-85`, `backdrop-opacity-85`. */
    const val opacity85 = 0.85f
    /** `opacity-90`, `backdrop-opacity-90`. */
    const val opacity90 = 0.9f
    /** `opacity-95`, `backdrop-opacity-95`. */
    const val opacity95 = 0.95f
    /** `opacity-100`, `backdrop-opacity-100`. Fully opaque. */
    const val opacity100 = 1f
    /** `opacity-disabled`. Every disabled control and item (50%). Set it once to change how disabled looks everywhere. */
    const val opacityDisabled = 0.5f
    /** The `state-layer` class on hover (8%): the element's text color laid over its own background. For surfaces the app colors itself; components keep their own tuned hover colors. */
    const val opacityStateHover = 0.08f
    /** The `state-layer` class while pressed (12%). */
    const val opacityStatePressed = 0.12f
    /** The `state-layer` class while dragged (16%), with `data-state="dragging"`. */
    const val opacityStateDragged = 0.16f
    /** Instant: no transition. */
    const val duration0 = 0L
    /** Micro feedback: checkbox ticks, toggles. */
    const val duration75 = 75L
    /** Presses and small exits: a button held down, a tooltip leaving. */
    const val duration100 = 100L
    /** Default: hover and focus colors, and small surfaces entering (tooltips, popovers, menus, date pickers). */
    const val duration150 = 150L
    /** Medium surfaces entering: dialogs and toasts. */
    const val duration200 = 200L
    /** Large surfaces entering: drawers and sheets. */
    const val duration300 = 300L
    /** Large surfaces or page-level changes. */
    const val duration500 = 500L
    /** Slow, deliberate emphasis. Use rarely. */
    const val duration700 = 700L
    /** Decorative or attention animations only. */
    const val duration1000 = 1000L
    /** Long loops, such as the pixel loader (1.2s). Decorative only. */
    const val duration1200 = 1200L
    /** No wait: `delay-0` cancels a delay set elsewhere. */
    const val delay0 = 0L
    /** One step of a stagger: the gap between list items arriving (`motion-stagger`). */
    const val delay50 = 50L
    /** One step of the pixel Loader's wave (`--loader-pixel-stagger`). */
    const val delay75 = 75L
    /** Short: a tooltip waits this long to close once the pointer leaves it. */
    const val delay100 = 100L
    /** The gap between the dots Loader's dots (`--loader-dots-stagger`). */
    const val delay150 = 150L
    /** Offsets one square of the random pixel Loader. */
    const val delay200 = 200L
    /** A loading indicator waits this long before it shows, so a quick wait doesn't flash one. */
    const val delay300 = 300L
    /** A HoverCard waits this long before it opens; a loading indicator, once shown, stays at least this long. */
    const val delay500 = 500L
    /** Offsets one square of the random pixel Loader. */
    const val delay700 = 700L
    /** Offsets one square of the random pixel Loader; the longest wait. */
    const val delay1000 = 1000L
    /** A press: a control answering while it's held down (Button scales down). */
    const val motionPress = 100L
    /** A press let go: the control springing back to its size with `ease-spring`. Longer than the press, because a spring spends its end settling; it is back in place in about a third of this. */
    const val motionRelease = 300L
    /** Hover and focus changes: colors, borders and shadows on a control that stays put. */
    const val motionHover = 150L
    /** A small surface appearing: tooltips, popovers, menus, date pickers. */
    const val motionEnterSm = 150L
    /** A medium surface appearing: dialogs and toasts. */
    const val motionEnterMd = 200L
    /** A large surface appearing: drawers and sheets. */
    const val motionEnterLg = 300L
    /** A small surface leaving. An exit takes about two thirds of its enter, so what was closed gets out of the way. */
    const val motionExitSm = 100L
    /** A medium surface leaving: dialogs and toasts. */
    const val motionExitMd = 150L
    /** A large surface leaving: drawers and sheets. */
    const val motionExitLg = 200L
    /** A small part changing in place: a chevron turning, a slider thumb growing, a dot widening, a row gliding to its place. */
    const val motionChangeSm = 150L
    /** A panel opening or collapsing in place, or an indicator sliding to the selected option: Accordion, Sidebar, SegmentedControl, Tabs. */
    const val motionChangeMd = 200L
    /** Something travelling far on screen: a progress or meter fill moving to its value, a carousel slide. */
    const val motionChangeLg = 300L
    /** One turn of a spinner, the one spinner speed: Loader's ring (and so Button, Badge and SearchInput), Switch and the circular Progress while they load. Under reduced motion they stand still and breathe over twice this. */
    const val motionLoopSpinner = 700L
    /** One pass of a loading placeholder's pulse: Image while it loads. */
    const val motionLoopPlaceholder = 1000L
    /** One blink of a text caret: PinInput. */
    const val motionLoopBlink = 1000L
    /** One pass of an indeterminate progress bar. */
    const val motionLoopProgress = 1200L
    /** A press ripple spreading out from the pointer: Button and Badge. */
    const val motionRipple = 500L
    /** A press ripple fading once it has spread. */
    const val motionRippleFade = 300L
    /** The gap between items of a group arriving one after another, for a group seen now and then (a page's cards, a first list of results), never one opened over and over (menu items, toasts). Each item waits its index times this. */
    const val motionStagger = 50L
    /** The longest any item of a staggered group waits, so a long list still arrives within a moment: items past the sixth arrive together. */
    const val motionStaggerLimit = 300L
    /** The offset between the steps of one entrance, so they read as a sequence: a dialog or drawer’s backdrop starts, then its panel. Exits don’t sequence; everything leaves together. */
    const val motionSequence = 50L
    /** `text-xs` font size (12px). */
    val textXs = 12.sp
    /** `text-sm` font size (14px). */
    val textSm = 14.sp
    /** `text-base` font size (16px). */
    val textBase = 16.sp
    /** `text-lg` font size (18px). */
    val textLg = 18.sp
    /** `text-xl` font size (20px). */
    val textXl = 20.sp
    /** `text-2xl` font size (24px). */
    val text2xl = 24.sp
    /** `text-3xl` font size (30px). */
    val text3xl = 30.sp
    /** `text-4xl` font size (36px). */
    val text4xl = 36.sp
    /** `text-5xl` font size (48px). */
    val text5xl = 48.sp
    /** `text-6xl` font size (60px). */
    val text6xl = 60.sp
    /** `text-7xl` font size (72px). */
    val text7xl = 72.sp
    /** `text-8xl` font size (96px). */
    val text8xl = 96.sp
    /** `text-9xl` font size (128px). */
    val text9xl = 128.sp
    /** The line height that goes with `text-xs`. */
    val textXsLineHeight = 16.sp
    /** The line height that goes with `text-sm`. */
    val textSmLineHeight = 20.sp
    /** The line height that goes with `text-base`. */
    val textBaseLineHeight = 24.sp
    /** The line height that goes with `text-lg`. */
    val textLgLineHeight = 28.sp
    /** The line height that goes with `text-xl`. */
    val textXlLineHeight = 28.sp
    /** The line height that goes with `text-2xl`. */
    val text2xlLineHeight = 32.sp
    /** The line height that goes with `text-3xl`. */
    val text3xlLineHeight = 36.sp
    /** The line height that goes with `text-4xl`. */
    val text4xlLineHeight = 40.sp
}

/** Every color of the palette, the same in every theme. */
object SerupaPalette {
    /** Pure white. */
    val white = Color(0xFFFFFFFF)
    /** Pure black. */
    val black = Color(0xFF000000)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val slate50 = Color(0xFFF8FAFC)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    val slate100 = Color(0xFFF1F5F9)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    val slate200 = Color(0xFFE2E8F0)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.1:1). */
    val slate300 = Color(0xFFCBD5E1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.2:1). */
    val slate400 = Color(0xFF94A3B8)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    val slate500 = Color(0xFF64748B)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    val slate600 = Color(0xFF475569)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    val slate700 = Color(0xFF334155)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    val slate800 = Color(0xFF1E293B)
    /** Text, dark surfaces. Text: white passes on it (17.9:1). */
    val slate900 = Color(0xFF0F172A)
    /** Text, dark surfaces. Text: white passes on it (20.2:1). */
    val slate950 = Color(0xFF020617)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val gray50 = Color(0xFFF9FAFB)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    val gray100 = Color(0xFFF3F4F6)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    val gray200 = Color(0xFFE5E7EB)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.3:1). */
    val gray300 = Color(0xFFD1D5DB)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    val gray400 = Color(0xFF9CA3AF)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    val gray500 = Color(0xFF6B7280)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    val gray600 = Color(0xFF4B5563)
    /** Text, dark surfaces. Text: white passes on it (10.3:1). */
    val gray700 = Color(0xFF374151)
    /** Text, dark surfaces. Text: white passes on it (14.7:1). */
    val gray800 = Color(0xFF1F2937)
    /** Text, dark surfaces. Text: white passes on it (17.7:1). */
    val gray900 = Color(0xFF111827)
    /** Text, dark surfaces. Text: white passes on it (20.1:1). */
    val gray950 = Color(0xFF030712)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val zinc50 = Color(0xFFFAFAFA)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    val zinc100 = Color(0xFFF4F4F5)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.6:1). */
    val zinc200 = Color(0xFFE4E4E7)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    val zinc300 = Color(0xFFD4D4D8)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.2:1). */
    val zinc400 = Color(0xFFA1A1AA)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    val zinc500 = Color(0xFF71717A)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.7:1). */
    val zinc600 = Color(0xFF52525B)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    val zinc700 = Color(0xFF3F3F46)
    /** Text, dark surfaces. Text: white passes on it (14.9:1). */
    val zinc800 = Color(0xFF27272A)
    /** Text, dark surfaces. Text: white passes on it (17.7:1). */
    val zinc900 = Color(0xFF18181B)
    /** Text, dark surfaces. Text: white passes on it (19.9:1). */
    val zinc950 = Color(0xFF09090B)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val neutral50 = Color(0xFFFAFAFA)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.3:1). */
    val neutral100 = Color(0xFFF5F5F5)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    val neutral200 = Color(0xFFE5E5E5)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    val neutral300 = Color(0xFFD4D4D4)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    val neutral400 = Color(0xFFA3A3A3)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    val neutral500 = Color(0xFF737373)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.8:1). */
    val neutral600 = Color(0xFF525252)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    val neutral700 = Color(0xFF404040)
    /** Text, dark surfaces. Text: white passes on it (15.1:1). */
    val neutral800 = Color(0xFF262626)
    /** Text, dark surfaces. Text: white passes on it (17.9:1). */
    val neutral900 = Color(0xFF171717)
    /** Text, dark surfaces. Text: white passes on it (19.8:1). */
    val neutral950 = Color(0xFF0A0A0A)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val stone50 = Color(0xFFFAFAF9)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    val stone100 = Color(0xFFF5F5F4)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    val stone200 = Color(0xFFE7E5E4)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.1:1). */
    val stone300 = Color(0xFFD6D3D1)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    val stone400 = Color(0xFFA8A29E)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    val stone500 = Color(0xFF78716C)
    /** Solid fills, buttons, brand accents. Text: white passes on it (7.6:1). */
    val stone600 = Color(0xFF57534E)
    /** Text, dark surfaces. Text: white passes on it (10.3:1). */
    val stone700 = Color(0xFF44403C)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    val stone800 = Color(0xFF292524)
    /** Text, dark surfaces. Text: white passes on it (17.5:1). */
    val stone900 = Color(0xFF1C1917)
    /** Text, dark surfaces. Text: white passes on it (19.8:1). */
    val stone950 = Color(0xFF0C0A09)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    val red50 = Color(0xFFFEF2F2)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.2:1). */
    val red100 = Color(0xFFFEE2E2)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.5:1). */
    val red200 = Color(0xFFFECACA)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.1:1). */
    val red300 = Color(0xFFFCA5A5)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.6:1). */
    val red400 = Color(0xFFF87171)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.8:1); black 5.6:1. */
    val red500 = Color(0xFFEF4444)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.8:1). */
    val red600 = Color(0xFFDC2626)
    /** Text, dark surfaces. Text: white passes on it (6.5:1). */
    val red700 = Color(0xFFB91C1C)
    /** Text, dark surfaces. Text: white passes on it (8.3:1). */
    val red800 = Color(0xFF991B1B)
    /** Text, dark surfaces. Text: white passes on it (10.0:1). */
    val red900 = Color(0xFF7F1D1D)
    /** Text, dark surfaces. Text: white passes on it (16.1:1). */
    val red950 = Color(0xFF450A0A)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.8:1). */
    val orange50 = Color(0xFFFFF7ED)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.3:1). */
    val orange100 = Color(0xFFFFEDD5)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.5:1). */
    val orange200 = Color(0xFFFED7AA)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.5:1). */
    val orange300 = Color(0xFFFDBA74)
    /** Borders, accents, decorative fills. Use dark text on it (black 9.3:1). */
    val orange400 = Color(0xFFFB923C)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.5:1). */
    val orange500 = Color(0xFFF97316)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.6:1); black 5.9:1. */
    val orange600 = Color(0xFFEA580C)
    /** Text, dark surfaces. Text: white passes on it (5.2:1). */
    val orange700 = Color(0xFFC2410C)
    /** Text, dark surfaces. Text: white passes on it (7.3:1). */
    val orange800 = Color(0xFF9A3412)
    /** Text, dark surfaces. Text: white passes on it (9.4:1). */
    val orange900 = Color(0xFF7C2D12)
    /** Text, dark surfaces. Text: white passes on it (15.7:1). */
    val orange950 = Color(0xFF431407)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    val amber50 = Color(0xFFFFFBEB)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.9:1). */
    val amber100 = Color(0xFFFEF3C7)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.9:1). */
    val amber200 = Color(0xFFFDE68A)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.6:1). */
    val amber300 = Color(0xFFFCD34D)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.6:1). */
    val amber400 = Color(0xFFFBBF24)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 9.8:1). */
    val amber500 = Color(0xFFF59E0B)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.2:1); black 6.6:1. */
    val amber600 = Color(0xFFD97706)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    val amber700 = Color(0xFFB45309)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    val amber800 = Color(0xFF92400E)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    val amber900 = Color(0xFF78350F)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    val amber950 = Color(0xFF451A03)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    val yellow50 = Color(0xFFFEFCE8)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    val yellow100 = Color(0xFFFEF9C3)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.0:1). */
    val yellow200 = Color(0xFFFEF08A)
    /** Borders, accents, decorative fills. Use dark text on it (black 15.9:1). */
    val yellow300 = Color(0xFFFDE047)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.7:1). */
    val yellow400 = Color(0xFFFACC15)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 11.0:1). */
    val yellow500 = Color(0xFFEAB308)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.1:1). */
    val yellow600 = Color(0xFFCA8A04)
    /** Text, dark surfaces. Text: white passes on it (4.9:1). */
    val yellow700 = Color(0xFFA16207)
    /** Text, dark surfaces. Text: white passes on it (6.9:1). */
    val yellow800 = Color(0xFF854D0E)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    val yellow900 = Color(0xFF713F12)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    val yellow950 = Color(0xFF422006)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.3:1). */
    val lime50 = Color(0xFFF7FEE7)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.4:1). */
    val lime100 = Color(0xFFECFCCB)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.0:1). */
    val lime200 = Color(0xFFD9F99D)
    /** Borders, accents, decorative fills. Use dark text on it (black 16.1:1). */
    val lime300 = Color(0xFFBEF264)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.9:1). */
    val lime400 = Color(0xFFA3E635)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 10.6:1). */
    val lime500 = Color(0xFF84CC16)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.1:1); black 6.8:1. */
    val lime600 = Color(0xFF65A30D)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    val lime700 = Color(0xFF4D7C0F)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    val lime800 = Color(0xFF3F6212)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    val lime900 = Color(0xFF365314)
    /** Text, dark surfaces. Text: white passes on it (14.6:1). */
    val lime950 = Color(0xFF1A2E05)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val green50 = Color(0xFFF0FDF4)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    val green100 = Color(0xFFDCFCE7)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.3:1). */
    val green200 = Color(0xFFBBF7D0)
    /** Borders, accents, decorative fills. Use dark text on it (black 15.0:1). */
    val green300 = Color(0xFF86EFAC)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.1:1). */
    val green400 = Color(0xFF4ADE80)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 9.2:1). */
    val green500 = Color(0xFF22C55E)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.3:1); black 6.4:1. */
    val green600 = Color(0xFF16A34A)
    /** Text, dark surfaces. Text: white passes on it (5.0:1). */
    val green700 = Color(0xFF15803D)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    val green800 = Color(0xFF166534)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    val green900 = Color(0xFF14532D)
    /** Text, dark surfaces. Text: white passes on it (14.9:1). */
    val green950 = Color(0xFF052E16)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.9:1). */
    val emerald50 = Color(0xFFECFDF5)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.5:1). */
    val emerald100 = Color(0xFFD1FAE5)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.4:1). */
    val emerald200 = Color(0xFFA7F3D0)
    /** Borders, accents, decorative fills. Use dark text on it (black 13.8:1). */
    val emerald300 = Color(0xFF6EE7B7)
    /** Borders, accents, decorative fills. Use dark text on it (black 10.9:1). */
    val emerald400 = Color(0xFF34D399)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.3:1). */
    val emerald500 = Color(0xFF10B981)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.8:1); black 5.6:1. */
    val emerald600 = Color(0xFF059669)
    /** Text, dark surfaces. Text: white passes on it (5.5:1). */
    val emerald700 = Color(0xFF047857)
    /** Text, dark surfaces. Text: white passes on it (7.7:1). */
    val emerald800 = Color(0xFF065F46)
    /** Text, dark surfaces. Text: white passes on it (9.7:1). */
    val emerald900 = Color(0xFF064E3B)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    val emerald950 = Color(0xFF022C22)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.1:1). */
    val teal50 = Color(0xFFF0FDFA)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.6:1). */
    val teal100 = Color(0xFFCCFBF1)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.7:1). */
    val teal200 = Color(0xFF99F6E4)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.2:1). */
    val teal300 = Color(0xFF5EEAD4)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.3:1). */
    val teal400 = Color(0xFF2DD4BF)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.4:1). */
    val teal500 = Color(0xFF14B8A6)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.6:1. */
    val teal600 = Color(0xFF0D9488)
    /** Text, dark surfaces. Text: white passes on it (5.5:1). */
    val teal700 = Color(0xFF0F766E)
    /** Text, dark surfaces. Text: white passes on it (7.6:1). */
    val teal800 = Color(0xFF115E59)
    /** Text, dark surfaces. Text: white passes on it (9.5:1). */
    val teal900 = Color(0xFF134E4A)
    /** Text, dark surfaces. Text: white passes on it (14.5:1). */
    val teal950 = Color(0xFF042F2E)
    /** Tints, subtle backgrounds. Use dark text on it (black 20.2:1). */
    val cyan50 = Color(0xFFECFEFF)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.8:1). */
    val cyan100 = Color(0xFFCFFAFE)
    /** Tints, subtle backgrounds. Use dark text on it (black 16.8:1). */
    val cyan200 = Color(0xFFA5F3FC)
    /** Borders, accents, decorative fills. Use dark text on it (black 14.5:1). */
    val cyan300 = Color(0xFF67E8F9)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    val cyan400 = Color(0xFF22D3EE)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 8.6:1). */
    val cyan500 = Color(0xFF06B6D4)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    val cyan600 = Color(0xFF0891B2)
    /** Text, dark surfaces. Text: white passes on it (5.4:1). */
    val cyan700 = Color(0xFF0E7490)
    /** Text, dark surfaces. Text: white passes on it (7.3:1). */
    val cyan800 = Color(0xFF155E75)
    /** Text, dark surfaces. Text: white passes on it (9.1:1). */
    val cyan900 = Color(0xFF164E63)
    /** Text, dark surfaces. Text: white passes on it (13.4:1). */
    val cyan950 = Color(0xFF083344)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.7:1). */
    val sky50 = Color(0xFFF0F9FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.3:1). */
    val sky100 = Color(0xFFE0F2FE)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.8:1). */
    val sky200 = Color(0xFFBAE6FD)
    /** Borders, accents, decorative fills. Use dark text on it (black 12.6:1). */
    val sky300 = Color(0xFF7DD3FC)
    /** Borders, accents, decorative fills. Use dark text on it (black 9.8:1). */
    val sky400 = Color(0xFF38BDF8)
    /** Solid fills, buttons, brand accents. Use dark text on it (black 7.6:1). */
    val sky500 = Color(0xFF0EA5E9)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.1:1); black 5.1:1. */
    val sky600 = Color(0xFF0284C7)
    /** Text, dark surfaces. Text: white passes on it (5.9:1). */
    val sky700 = Color(0xFF0369A1)
    /** Text, dark surfaces. Text: white passes on it (7.6:1). */
    val sky800 = Color(0xFF075985)
    /** Text, dark surfaces. Text: white passes on it (9.5:1). */
    val sky900 = Color(0xFF0C4A6E)
    /** Text, dark surfaces. Text: white passes on it (13.9:1). */
    val sky950 = Color(0xFF082F49)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.3:1). */
    val blue50 = Color(0xFFEFF6FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.2:1). */
    val blue100 = Color(0xFFDBEAFE)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.8:1). */
    val blue200 = Color(0xFFBFDBFE)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    val blue300 = Color(0xFF93C5FD)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.3:1). */
    val blue400 = Color(0xFF60A5FA)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    val blue500 = Color(0xFF3B82F6)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.2:1). */
    val blue600 = Color(0xFF2563EB)
    /** Text, dark surfaces. Text: white passes on it (6.7:1). */
    val blue700 = Color(0xFF1D4ED8)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    val blue800 = Color(0xFF1E40AF)
    /** Text, dark surfaces. Text: white passes on it (10.4:1). */
    val blue900 = Color(0xFF1E3A8A)
    /** Text, dark surfaces. Text: white passes on it (14.7:1). */
    val blue950 = Color(0xFF172554)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.8:1). */
    val indigo50 = Color(0xFFEEF2FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.0:1). */
    val indigo100 = Color(0xFFE0E7FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.1:1). */
    val indigo200 = Color(0xFFC7D2FE)
    /** Borders, accents, decorative fills. Use dark text on it (black 10.5:1). */
    val indigo300 = Color(0xFFA5B4FC)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.0:1). */
    val indigo400 = Color(0xFF818CF8)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.5:1); black 4.7:1. */
    val indigo500 = Color(0xFF6366F1)
    /** Solid fills, buttons, brand accents. Text: white passes on it (6.3:1). */
    val indigo600 = Color(0xFF4F46E5)
    /** Text, dark surfaces. Text: white passes on it (7.9:1). */
    val indigo700 = Color(0xFF4338CA)
    /** Text, dark surfaces. Text: white passes on it (9.9:1). */
    val indigo800 = Color(0xFF3730A3)
    /** Text, dark surfaces. Text: white passes on it (11.4:1). */
    val indigo900 = Color(0xFF312E81)
    /** Text, dark surfaces. Text: white passes on it (16.0:1). */
    val indigo950 = Color(0xFF1E1B4B)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    val violet50 = Color(0xFFF5F3FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.7:1). */
    val violet100 = Color(0xFFEDE9FE)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.1:1). */
    val violet200 = Color(0xFFDDD6FE)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.4:1). */
    val violet300 = Color(0xFFC4B5FD)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.7:1). */
    val violet400 = Color(0xFFA78BFA)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.2:1); black 5.0:1. */
    val violet500 = Color(0xFF8B5CF6)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.7:1). */
    val violet600 = Color(0xFF7C3AED)
    /** Text, dark surfaces. Text: white passes on it (7.1:1). */
    val violet700 = Color(0xFF6D28D9)
    /** Text, dark surfaces. Text: white passes on it (9.0:1). */
    val violet800 = Color(0xFF5B21B6)
    /** Text, dark surfaces. Text: white passes on it (11.0:1). */
    val violet900 = Color(0xFF4C1D95)
    /** Text, dark surfaces. Text: white passes on it (15.2:1). */
    val violet950 = Color(0xFF2E1065)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    val purple50 = Color(0xFFFAF5FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.8:1). */
    val purple100 = Color(0xFFF3E8FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.4:1). */
    val purple200 = Color(0xFFE9D5FF)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.9:1). */
    val purple300 = Color(0xFFD8B4FE)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.9:1). */
    val purple400 = Color(0xFFC084FC)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (4.0:1); black 5.3:1. */
    val purple500 = Color(0xFFA855F7)
    /** Solid fills, buttons, brand accents. Text: white passes on it (5.4:1). */
    val purple600 = Color(0xFF9333EA)
    /** Text, dark surfaces. Text: white passes on it (7.0:1). */
    val purple700 = Color(0xFF7E22CE)
    /** Text, dark surfaces. Text: white passes on it (8.7:1). */
    val purple800 = Color(0xFF6B21A8)
    /** Text, dark surfaces. Text: white passes on it (10.9:1). */
    val purple900 = Color(0xFF581C87)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    val purple950 = Color(0xFF3B0764)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.6:1). */
    val fuchsia50 = Color(0xFFFDF4FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 18.1:1). */
    val fuchsia100 = Color(0xFFFAE8FF)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.3:1). */
    val fuchsia200 = Color(0xFFF5D0FE)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.9:1). */
    val fuchsia300 = Color(0xFFF0ABFC)
    /** Borders, accents, decorative fills. Use dark text on it (black 8.5:1). */
    val fuchsia400 = Color(0xFFE879F9)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.5:1); black 6.1:1. */
    val fuchsia500 = Color(0xFFD946EF)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    val fuchsia600 = Color(0xFFC026D3)
    /** Text, dark surfaces. Text: white passes on it (6.3:1). */
    val fuchsia700 = Color(0xFFA21CAF)
    /** Text, dark surfaces. Text: white passes on it (8.2:1). */
    val fuchsia800 = Color(0xFF86198F)
    /** Text, dark surfaces. Text: white passes on it (10.0:1). */
    val fuchsia900 = Color(0xFF701A75)
    /** Text, dark surfaces. Text: white passes on it (14.8:1). */
    val fuchsia950 = Color(0xFF4A044E)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.2:1). */
    val pink50 = Color(0xFFFDF2F8)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.9:1). */
    val pink100 = Color(0xFFFCE7F3)
    /** Tints, subtle backgrounds. Use dark text on it (black 15.2:1). */
    val pink200 = Color(0xFFFBCFE8)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.6:1). */
    val pink300 = Color(0xFFF9A8D4)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.9:1). */
    val pink400 = Color(0xFFF472B6)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.5:1); black 6.0:1. */
    val pink500 = Color(0xFFEC4899)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.6:1). */
    val pink600 = Color(0xFFDB2777)
    /** Text, dark surfaces. Text: white passes on it (6.0:1). */
    val pink700 = Color(0xFFBE185D)
    /** Text, dark surfaces. Text: white passes on it (7.9:1). */
    val pink800 = Color(0xFF9D174D)
    /** Text, dark surfaces. Text: white passes on it (9.6:1). */
    val pink900 = Color(0xFF831843)
    /** Text, dark surfaces. Text: white passes on it (15.0:1). */
    val pink950 = Color(0xFF500724)
    /** Tints, subtle backgrounds. Use dark text on it (black 19.1:1). */
    val rose50 = Color(0xFFFFF1F2)
    /** Tints, subtle backgrounds. Use dark text on it (black 17.5:1). */
    val rose100 = Color(0xFFFFE4E6)
    /** Tints, subtle backgrounds. Use dark text on it (black 14.9:1). */
    val rose200 = Color(0xFFFECDD3)
    /** Borders, accents, decorative fills. Use dark text on it (black 11.1:1). */
    val rose300 = Color(0xFFFDA4AF)
    /** Borders, accents, decorative fills. Use dark text on it (black 7.8:1). */
    val rose400 = Color(0xFFFB7185)
    /** Solid fills, buttons, brand accents. White passes only for large text/icons (3.7:1); black 5.7:1. */
    val rose500 = Color(0xFFF43F5E)
    /** Solid fills, buttons, brand accents. Text: white passes on it (4.7:1). */
    val rose600 = Color(0xFFE11D48)
    /** Text, dark surfaces. Text: white passes on it (6.3:1). */
    val rose700 = Color(0xFFBE123C)
    /** Text, dark surfaces. Text: white passes on it (8.0:1). */
    val rose800 = Color(0xFF9F1239)
    /** Text, dark surfaces. Text: white passes on it (9.6:1). */
    val rose900 = Color(0xFF881337)
    /** Text, dark surfaces. Text: white passes on it (15.6:1). */
    val rose950 = Color(0xFF4C0519)
}

/** The alias colors, one set per theme: SerupaColors.AmberDark.primary. */
data class SerupaColors(
    /** Alias. Brand color: primary buttons, links, selected states. Light themes: brand 600 (emerald 700) with white text; dark themes: brand 400 with brand-950 text. More contrast: brand 800 / brand 300, 7:1+ on `surface` and `primary-subtle`. */
    val primary: Color,
    /** Alias. Hover / pressed state of `primary` (one step darker in light themes, lighter in dark). More contrast: brand 900 / brand 200. */
    val primaryHover: Color,
    /** Alias. Pressed state of `primary`: one step past `primary-hover` (darker in light themes, lighter in dark), so a held primary button reads as held without a shrink. More contrast: one step past its more-contrast hover where the scale goes on. */
    val primaryPressed: Color,
    /** Alias. Brand tint for selected rows and badges (brand 50 light, brand 950 dark). */
    val primarySubtle: Color,
    /** Alias. Pressed state of a fill in `primary-subtle` (a secondary button held down): one step past it (brand 100 light, brand 900 dark). `primary-hover` keeps 4.5:1 on it. */
    val primarySubtlePressed: Color,
    /** Alias. Text and icons on `primary` fills (white in light themes, brand 950 in dark). */
    val onPrimary: Color,
    /** Alias. Secondary button fill; hover fill for outline and ghost buttons. */
    val secondary: Color,
    /** Alias. Hover state of `secondary`. */
    val secondaryHover: Color,
    /** Alias. Pressed state of `secondary`, a step past `secondary-hover` (`pressed` is the same gray as `secondary-hover` in dark). */
    val secondaryPressed: Color,
    /** The keyboard-highlighted item in a list: Menu items, Combobox and TimePicker options, the Sidebar's current page. In light the same zinc-100 as `secondary` (about 1.1:1 on `surface`); in dark it shares `secondary`'s zinc-700 (1.7:1 on `surface`, 1.4:1 on `surface-overlay`), with no bar by default (`highlight-indicator`). Text on it keeps 4.5:1. */
    val highlight: Color,
    /** Alias. The fill while a row, tab, day or page button is held down (`:active`): one step past its hover. `text` keeps 7:1+ on it. */
    val pressed: Color,
    /** Alias. Card, panel and bar background (white light, zinc-900 dark). The page behind them is `surface-page`. */
    val surface: Color,
    /** Alias. The page itself: the <html> and <body> background, and a data-mode or data-theme section's. White in light, as `surface`; in dark zinc-950, a step below the zinc-900 cards, panels and bars on it, so they and every control (fields, buttons, SegmentedControl's track) sit lighter than the page. */
    val surfacePage: Color,
    /** Alias. Secondary panels, sidebars, table headers, filled Cards and wells: recessed, so a step below `surface` in both modes (zinc-50 under white in light, zinc-950 under zinc-900 in dark). A recess, so never the fill of something you press: controls use `surface-control`. */
    val surfaceMuted: Color,
    /** Alias. The fill of a control that is its own surface rather than a field: SegmentedControl's track, FileUpload's drop zone. zinc-50 in light, as `surface-muted`; in dark a step above the zinc-950 page (zinc-900), so a control is never darker than the surface it sits on. */
    val surfaceControl: Color,
    /** Alias. A row or item on `surface` under the pointer, a selected row, a striped row (List, Table, InlineEdit): a step off `surface` in every theme (zinc-100 light, the same as `highlight`; zinc-800 dark). Grey text on it reads `text-muted-shaded`. */
    val surfaceHover: Color,
    /** Alias. A List or InlineEdit row under the pointer or selected on a raised or floating surface (an elevated Card, a Popover, Dialog or Drawer): zinc-100 in light; in dark a step above zinc-800, halfway to zinc-700, where muted text keeps 4.5:1. Grey text on it reads `text-muted-shaded`. */
    val surfaceHoverRaised: Color,
    /** Alias. A raised card (Card `elevated`). One step up from `surface` in dark, where a shadow doesn't show. */
    val surfaceRaised: Color,
    /** Alias. Anything in the top layer: Menu, Popover, Dialog, Drawer, Toast and the Combobox, DatePicker and TimePicker lists. */
    val surfaceOverlay: Color,
    /** Alias. Background of text inputs, selects and other form fields: white in light, zinc-800 in dark, a fill that sets a field apart from the page and cards around it. */
    val field: Color,
    /** Alias. Background of a read-only or disabled form field: a step flatter than `field` (zinc-50 in light, zinc-900 in dark), so it reads as not editable while its `field-border` still outlines it. */
    val fieldReadonly: Color,
    /** Alias. The text, icon and mark of anything disabled, in place of fading it: the same neutral in every brand, so a disabled primary, danger or brand control reads as off, never as a faint version of itself. At least 3:1 on `disabled-surface` and the surfaces (4.5:1 with more contrast). */
    val disabledText: Color,
    /** Alias. The fill of a disabled control that has one (a checked box, a switch's track, a slider's fill, the selected segment): a neutral a step off the page, whatever its color when on. */
    val disabledSurface: Color,
    /** Alias. The edge of a disabled control: a box, a track, a field's border. */
    val disabledBorder: Color,
    /** The 2px bar at the start of the highlighted item in a dropdown list: Menu items, and Combobox, Select, TimePicker, MentionInput and CommandPalette options. By default it is the same color as `highlight` in every theme (change both together), so no bar shows and the grey fill alone marks the item: under the 3:1 WCAG 1.4.11 asks, a deliberate design choice, as with `field-border`. The item is also the one the screen reader names and the one Enter picks. More contrast (`data-contrast="more"` or the system setting) turns the bar `text`-dark, 3:1+ on `highlight`, and forced colors outline the item in `Highlight`. */
    val highlightIndicator: Color,
    /** Alias. Border of form fields (Input, Textarea, Select, Combobox, the pickers, Checkbox, Radio, PinInput) and SegmentedControl's track: a soft line, zinc-300 in light and zinc-700 in dark, a step lighter than the zinc-800 field. It is under the 3:1 WCAG 1.4.11 asks of a control's boundary, a deliberate design choice: the field also shows by its label above it, and in dark by its zinc-800 fill, hover and focus are stronger, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. Other controls' edges use `border-control`. */
    val fieldBorder: Color,
    /** Alias. Field border on hover: the resting `field-border` one gray step stronger (zinc-400 in light, zinc-600 in dark), so the field answers the pointer without taking the accent, which stays for focus. */
    val fieldBorderHover: Color,
    /** Alias. Field border while held down (Checkbox's box, Radio's circle): `field-border-hover` one gray step stronger again (zinc-500 in light, zinc-500 in dark). */
    val fieldBorderPressed: Color,
    /** Alias. The 3:1 edge of a control that isn't a text or choice field: Slider's track, Switch's track, Progress and Meter's track edge, Carousel's dots, ColorPicker's swatch edge, Stepper's ring and line, Rating's empty stars, Kbd, Splitter, ScrollArea's thumb and Avatar's offline dot. 3:1+ against `surface` in every theme (WCAG 1.4.11). */
    val borderControl: Color,
    /** Alias. `border-control` on hover, one step stronger (Switch's track). */
    val borderControlHover: Color,
    /** Alias. `border-control` while held down, one step past `border-control-hover` (Switch's track). */
    val borderControlPressed: Color,
    /** Alias. The fill of a button inside a field under the pointer (a calendar or clock button, Input's icon action, NumberInput's steppers, the country button): `secondary` in light, zinc-700 in dark, a step past the zinc-800 field. */
    val fieldHover: Color,
    /** Alias. The fill of a button inside a field while it's held down, one step past `field-hover` (zinc-200 in light, zinc-600 in dark; text keeps 4.5:1 on it). */
    val fieldPressed: Color,
    /** Alias. `field` on a raised or floating surface (Dialog, Drawer, Popover, an elevated Card, a bg-surface-raised or bg-surface-overlay panel), which set `--field` to it: white in light; in dark a step above the zinc-800 overlay (#333338, as `surface-hover-raised`), so a field in a dialog still stands out from it instead of matching it. `field-hover` and `field-pressed` already sit a step past it. */
    val fieldRaised: Color,
    /** Alias. An invalid field's border: `danger` (red 600), 3:1+ on `field` and `surface`. Its own alias so a theme whose field fill is lighter can take a lighter red. */
    val fieldBorderInvalid: Color,
    /** Alias. A text action inside a field (Input's "Apply"): `primary`, which keeps 4.5:1 on the field. Its own alias so a brand whose primary falls short on the field can take a lighter shade. */
    val fieldAction: Color,
    /** Alias. Placeholder text in form fields, and the other muted text inside a field: a prefix or suffix, a character count, the Caps Lock hint (4.5:1+ on `field` and `field-readonly`). Placeholders are hints, never labels. */
    val placeholder: Color,
    /** Alias. The dimmed backdrop behind dialogs and drawers (zinc-900 at 50% in light themes, zinc-950 at 70% in dark). */
    val overlay: Color,
    /** Alias. A hairline just inside a photo's edge (Image, Avatar), so a picture with a white or black background keeps its shape on a page of the same color: black at 10% in light themes, white at 10% in dark. */
    val pictureEdge: Color,
    /** Alias. Contrasting blocks: tooltips, inverse banners. */
    val surfaceInverse: Color,
    /** Alias. Body text and headings on `surface`. */
    val text: Color,
    /** Alias. Secondary text, captions, placeholders (4.5:1+ on `surface` in every theme). */
    val textMuted: Color,
    /** Alias. Secondary text inside a shaded row (`surface-hover`, `surface-hover-raised`: hovered, selected or striped), where `text-muted` would fall under 4.5:1 on zinc-100: zinc-600 in light, `text-muted`'s zinc-400 in dark. 4.5:1+ on either fill in every theme. */
    val textMutedShaded: Color,
    /** Alias. Text on `surface-inverse`. */
    val textInverse: Color,
    /** Alias. Default borders and dividers: zinc-200 in light; zinc-800 in dark, a step off the zinc-900 cards and bars it outlines. A quiet line, never a control's boundary: those use `field-border` or `border-control`. */
    val border: Color,
    /** Alias. Emphasised dividers and outlines. Form fields use `field-border`, which meets the 3:1 a control boundary needs. */
    val borderStrong: Color,
    /** Alias. The edge of a top-layer surface. In dark it is one step stronger than `border`, so a menu stands off the page. */
    val borderOverlay: Color,
    /** Alias. Keyboard focus outline, in the brand hue (3:1+ on `surface` in every theme). More contrast: brand 700 / brand 300. */
    val focusRing: Color,
    /** Alias. Success icons and fills (3:1). For success text use `success-text`. */
    val success: Color,
    /** Alias. Success alert / badge background. */
    val successSubtle: Color,
    /** Alias. Success text on `surface`, `surface-muted` and `success-subtle` (4.5:1+ in every theme). */
    val successText: Color,
    /** Alias. Hover / pressed state of `success` fills; `on-success` stays 4.5:1+ on it. */
    val successHover: Color,
    /** Alias. Text and icons on `success` fills (4.5:1+ in every theme). */
    val onSuccess: Color,
    /** Alias. Hover fill of an interactive `success-subtle` surface; `success-text` stays 4.5:1+ on it. */
    val successSubtleHover: Color,
    /** Alias. Border of a success outline control or callout. */
    val successBorder: Color,
    /** Alias. Warning icons and fills; put dark text on it. For warning text use `warning-text`. */
    val warning: Color,
    /** Alias. Warning alert / badge background. */
    val warningSubtle: Color,
    /** Alias. Warning text on `surface`, `surface-muted` and `warning-subtle` (4.5:1+ in every theme). */
    val warningText: Color,
    /** Alias. Hover / pressed state of `warning` fills; `on-warning` stays 4.5:1+ on it. */
    val warningHover: Color,
    /** Alias. Text and icons on `warning` fills (4.5:1+ in every theme). */
    val onWarning: Color,
    /** Alias. Hover fill of an interactive `warning-subtle` surface; `warning-text` stays 4.5:1+ on it. */
    val warningSubtleHover: Color,
    /** Alias. Border of a warning outline control or callout. */
    val warningBorder: Color,
    /** Alias. Errors, destructive buttons; white text on it (4.8:1). For error text on dark surfaces use `red-400`. */
    val danger: Color,
    /** Alias. Hover / pressed state of `danger`. */
    val dangerHover: Color,
    /** Alias. Pressed state of `danger`: one step past `danger-hover`; `on-danger` keeps 4.5:1 on it. */
    val dangerPressed: Color,
    /** Alias. Text and icons on `danger` fills. */
    val onDanger: Color,
    /** Alias. Error alert / badge background. */
    val dangerSubtle: Color,
    /** Alias. Destructive text and icons on `surface`, `danger-subtle` and its hover (5.3:1+ in every theme). */
    val dangerText: Color,
    /** Alias. Hover fill for destructive secondary, outline and ghost buttons. */
    val dangerSubtleHover: Color,
    /** Alias. Border of a destructive outline button. */
    val dangerBorder: Color,
    /** Alias. Informational icons and text. */
    val info: Color,
    /** Alias. Info alert / badge background. */
    val infoSubtle: Color,
    /** Alias. Info text on `surface`, `surface-muted` and `info-subtle` (4.5:1+ in every theme). */
    val infoText: Color,
    /** Alias. Hover / pressed state of `info` fills; `on-info` stays 4.5:1+ on it. */
    val infoHover: Color,
    /** Alias. Text and icons on `info` fills (4.5:1+ in every theme). */
    val onInfo: Color,
    /** Alias. Hover fill of an interactive `info-subtle` surface; `info-text` stays 4.5:1+ on it. */
    val infoSubtleHover: Color,
    /** Alias. Border of a info outline control or callout. */
    val infoBorder: Color,
    /** Alias. A visited link in reading content (Prose): a shade apart from primary, 4.5:1+ on `surface` and `surface-muted` in every theme. */
    val linkVisited: Color,
    /** Alias. Chart series 1 (blue): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart1: Color,
    /** Alias. Chart series 2 (orange): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart2: Color,
    /** Alias. Chart series 3 (pink): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart3: Color,
    /** Alias. Chart series 4 (cyan): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart4: Color,
    /** Alias. Chart series 5 (brown): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart5: Color,
    /** Alias. Chart series 6 (teal): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart6: Color,
    /** Alias. Chart series 7 (violet): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart7: Color,
    /** Alias. Chart series 8 (red): a line, bar, slice or marker. Every series is 3:1+ on `surface` and `surface-raised` in every theme; neighbors differ by hue for every reader (OKLab ΔE 15+, 8+ under protanopia and deuteranopia), the first four as every pair (15+, 10+ under protanopia and deuteranopia, 8+ under tritanopia), alternate darker and lighter in light themes, and `chart-gap` keeps them apart. */
    val chart8: Color,
    /** Alias. Sequential ramp, step 1 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    val chartSeq1: Color,
    /** Alias. Sequential ramp, step 2 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    val chartSeq2: Color,
    /** Alias. Sequential ramp, step 3 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    val chartSeq3: Color,
    /** Alias. Sequential ramp, step 4 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before. */
    val chartSeq4: Color,
    /** Alias. Sequential ramp, step 5 of 5 (low to high): a heat map or a choropleth. Each step stands out more from `surface` than the one before, and the last is 3:1+. */
    val chartSeq5: Color,
    /** Alias. Diverging ramp, step 1 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    val chartDiv1: Color,
    /** Alias. Diverging ramp, step 2 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    val chartDiv2: Color,
    /** Alias. Diverging ramp, step 3 of 7 (below the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    val chartDiv3: Color,
    /** Alias. Diverging ramp, step 4 of 7 (the middle, no change): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    val chartDiv4: Color,
    /** Alias. Diverging ramp, step 5 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    val chartDiv5: Color,
    /** Alias. Diverging ramp, step 6 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle. */
    val chartDiv6: Color,
    /** Alias. Diverging ramp, step 7 of 7 (above the middle): change from a baseline, red under it and blue over it. Steps stand out more from `surface` the further they are from the middle; the ends are 3:1+. */
    val chartDiv7: Color,
    /** Alias. Chart grid lines: quiet, behind the data. */
    val chartGrid: Color,
    /** Alias. Chart axis lines and ticks (3:1+ on `surface` in every theme). */
    val chartAxis: Color,
    /** Alias. Chart axis labels, values and legend text (4.5:1+ on `surface` and `surface-raised` in every theme). */
    val chartLabel: Color,
    /** Alias. The gap drawn between neighboring bars, slices and areas, so each one has 3:1+ against what touches it (WCAG 1.4.11). The page color: set it to the card's on a raised surface. */
    val chartGap: Color,
) {
    companion object {
        val AmberDark = SerupaColors(
            primary = Color(0xFFFBBF24),
            primaryHover = Color(0xFFFCD34D),
            primaryPressed = Color(0xFFFDE68A),
            primarySubtle = Color(0xFF451A03),
            primarySubtlePressed = Color(0xFF78350F),
            onPrimary = Color(0xFF451A03),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFFBBF24),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFFBBF24),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val AmberLight = SerupaColors(
            primary = Color(0xFFB45309),
            primaryHover = Color(0xFF92400E),
            primaryPressed = Color(0xFF78350F),
            primarySubtle = Color(0xFFFFFBEB),
            primarySubtlePressed = Color(0xFFFEF3C7),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFB45309),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFD97706),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val BlueDark = SerupaColors(
            primary = Color(0xFF60A5FA),
            primaryHover = Color(0xFF93C5FD),
            primaryPressed = Color(0xFFBFDBFE),
            primarySubtle = Color(0xFF172554),
            primarySubtlePressed = Color(0xFF1E3A8A),
            onPrimary = Color(0xFF172554),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF60A5FA),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF60A5FA),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val BlueLight = SerupaColors(
            primary = Color(0xFF2563EB),
            primaryHover = Color(0xFF1D4ED8),
            primaryPressed = Color(0xFF1E40AF),
            primarySubtle = Color(0xFFEFF6FF),
            primarySubtlePressed = Color(0xFFDBEAFE),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF2563EB),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF3B82F6),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val CyanDark = SerupaColors(
            primary = Color(0xFF22D3EE),
            primaryHover = Color(0xFF67E8F9),
            primaryPressed = Color(0xFFA5F3FC),
            primarySubtle = Color(0xFF083344),
            primarySubtlePressed = Color(0xFF164E63),
            onPrimary = Color(0xFF083344),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF22D3EE),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF22D3EE),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val CyanLight = SerupaColors(
            primary = Color(0xFF0E7490),
            primaryHover = Color(0xFF155E75),
            primaryPressed = Color(0xFF164E63),
            primarySubtle = Color(0xFFECFEFF),
            primarySubtlePressed = Color(0xFFCFFAFE),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF0E7490),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0891B2),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val EmeraldDark = SerupaColors(
            primary = Color(0xFF34D399),
            primaryHover = Color(0xFF6EE7B7),
            primaryPressed = Color(0xFFA7F3D0),
            primarySubtle = Color(0xFF022C22),
            primarySubtlePressed = Color(0xFF064E3B),
            onPrimary = Color(0xFF022C22),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF34D399),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF34D399),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val EmeraldLight = SerupaColors(
            primary = Color(0xFF047857),
            primaryHover = Color(0xFF065F46),
            primaryPressed = Color(0xFF064E3B),
            primarySubtle = Color(0xFFECFDF5),
            primarySubtlePressed = Color(0xFFD1FAE5),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF047857),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF059669),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val FuchsiaDark = SerupaColors(
            primary = Color(0xFFE879F9),
            primaryHover = Color(0xFFF0ABFC),
            primaryPressed = Color(0xFFF5D0FE),
            primarySubtle = Color(0xFF4A044E),
            primarySubtlePressed = Color(0xFF701A75),
            onPrimary = Color(0xFF4A044E),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFE879F9),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFE879F9),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val FuchsiaLight = SerupaColors(
            primary = Color(0xFFC026D3),
            primaryHover = Color(0xFFA21CAF),
            primaryPressed = Color(0xFF86198F),
            primarySubtle = Color(0xFFFDF4FF),
            primarySubtlePressed = Color(0xFFFAE8FF),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFC026D3),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFD946EF),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val GreenDark = SerupaColors(
            primary = Color(0xFF4ADE80),
            primaryHover = Color(0xFF86EFAC),
            primaryPressed = Color(0xFFBBF7D0),
            primarySubtle = Color(0xFF052E16),
            primarySubtlePressed = Color(0xFF14532D),
            onPrimary = Color(0xFF052E16),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF4ADE80),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF4ADE80),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val GreenLight = SerupaColors(
            primary = Color(0xFF15803D),
            primaryHover = Color(0xFF166534),
            primaryPressed = Color(0xFF14532D),
            primarySubtle = Color(0xFFF0FDF4),
            primarySubtlePressed = Color(0xFFDCFCE7),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF15803D),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF16A34A),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val IndigoDark = SerupaColors(
            primary = Color(0xFF818CF8),
            primaryHover = Color(0xFFA5B4FC),
            primaryPressed = Color(0xFFC7D2FE),
            primarySubtle = Color(0xFF1E1B4B),
            primarySubtlePressed = Color(0xFF312E81),
            onPrimary = Color(0xFF1E1B4B),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF818CF8),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF818CF8),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFF0ABFC),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val IndigoLight = SerupaColors(
            primary = Color(0xFF4F46E5),
            primaryHover = Color(0xFF4338CA),
            primaryPressed = Color(0xFF3730A3),
            primarySubtle = Color(0xFFEEF2FF),
            primarySubtlePressed = Color(0xFFE0E7FF),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF4F46E5),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF6366F1),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFFA21CAF),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val LimeDark = SerupaColors(
            primary = Color(0xFFA3E635),
            primaryHover = Color(0xFFBEF264),
            primaryPressed = Color(0xFFD9F99D),
            primarySubtle = Color(0xFF1A2E05),
            primarySubtlePressed = Color(0xFF365314),
            onPrimary = Color(0xFF1A2E05),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFA3E635),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFA3E635),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val LimeLight = SerupaColors(
            primary = Color(0xFF4D7C0F),
            primaryHover = Color(0xFF3F6212),
            primaryPressed = Color(0xFF365314),
            primarySubtle = Color(0xFFF7FEE7),
            primarySubtlePressed = Color(0xFFECFCCB),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF4D7C0F),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF4D7C0F),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val OrangeDark = SerupaColors(
            primary = Color(0xFFFB923C),
            primaryHover = Color(0xFFFDBA74),
            primaryPressed = Color(0xFFFED7AA),
            primarySubtle = Color(0xFF431407),
            primarySubtlePressed = Color(0xFF7C2D12),
            onPrimary = Color(0xFF431407),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFFB923C),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFFB923C),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val OrangeLight = SerupaColors(
            primary = Color(0xFFC2410C),
            primaryHover = Color(0xFF9A3412),
            primaryPressed = Color(0xFF7C2D12),
            primarySubtle = Color(0xFFFFF7ED),
            primarySubtlePressed = Color(0xFFFFEDD5),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFC2410C),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEA580C),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val PinkDark = SerupaColors(
            primary = Color(0xFFF472B6),
            primaryHover = Color(0xFFF9A8D4),
            primaryPressed = Color(0xFFFBCFE8),
            primarySubtle = Color(0xFF500724),
            primarySubtlePressed = Color(0xFF831843),
            onPrimary = Color(0xFF500724),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFF472B6),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFF472B6),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val PinkLight = SerupaColors(
            primary = Color(0xFFBE185D),
            primaryHover = Color(0xFF9D174D),
            primaryPressed = Color(0xFF831843),
            primarySubtle = Color(0xFFFDF2F8),
            primarySubtlePressed = Color(0xFFFCE7F3),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFBE185D),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEC4899),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val PurpleDark = SerupaColors(
            primary = Color(0xFFC084FC),
            primaryHover = Color(0xFFD8B4FE),
            primaryPressed = Color(0xFFE9D5FF),
            primarySubtle = Color(0xFF3B0764),
            primarySubtlePressed = Color(0xFF581C87),
            onPrimary = Color(0xFF3B0764),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFC084FC),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFC084FC),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFF0ABFC),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val PurpleLight = SerupaColors(
            primary = Color(0xFF9333EA),
            primaryHover = Color(0xFF7E22CE),
            primaryPressed = Color(0xFF6B21A8),
            primarySubtle = Color(0xFFFAF5FF),
            primarySubtlePressed = Color(0xFFF3E8FF),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF9333EA),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFA855F7),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFFA21CAF),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val RedDark = SerupaColors(
            primary = Color(0xFFF87171),
            primaryHover = Color(0xFFFCA5A5),
            primaryPressed = Color(0xFFFECACA),
            primarySubtle = Color(0xFF450A0A),
            primarySubtlePressed = Color(0xFF7F1D1D),
            onPrimary = Color(0xFF450A0A),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFF87171),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFF87171),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val RedLight = SerupaColors(
            primary = Color(0xFFDC2626),
            primaryHover = Color(0xFFB91C1C),
            primaryPressed = Color(0xFF991B1B),
            primarySubtle = Color(0xFFFEF2F2),
            primarySubtlePressed = Color(0xFFFEE2E2),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFDC2626),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEF4444),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val RoseDark = SerupaColors(
            primary = Color(0xFFFB7185),
            primaryHover = Color(0xFFFDA4AF),
            primaryPressed = Color(0xFFFECDD3),
            primarySubtle = Color(0xFF4C0519),
            primarySubtlePressed = Color(0xFF881337),
            onPrimary = Color(0xFF4C0519),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFFB7185),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFFB7185),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val RoseLight = SerupaColors(
            primary = Color(0xFFE11D48),
            primaryHover = Color(0xFFBE123C),
            primaryPressed = Color(0xFF9F1239),
            primarySubtle = Color(0xFFFFF1F2),
            primarySubtlePressed = Color(0xFFFFE4E6),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFE11D48),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFF43F5E),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val SkyDark = SerupaColors(
            primary = Color(0xFF38BDF8),
            primaryHover = Color(0xFF7DD3FC),
            primaryPressed = Color(0xFFBAE6FD),
            primarySubtle = Color(0xFF082F49),
            primarySubtlePressed = Color(0xFF0C4A6E),
            onPrimary = Color(0xFF082F49),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF38BDF8),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF38BDF8),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val SkyLight = SerupaColors(
            primary = Color(0xFF0369A1),
            primaryHover = Color(0xFF075985),
            primaryPressed = Color(0xFF0C4A6E),
            primarySubtle = Color(0xFFF0F9FF),
            primarySubtlePressed = Color(0xFFE0F2FE),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF0369A1),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0284C7),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val TealDark = SerupaColors(
            primary = Color(0xFF2DD4BF),
            primaryHover = Color(0xFF5EEAD4),
            primaryPressed = Color(0xFF99F6E4),
            primarySubtle = Color(0xFF042F2E),
            primarySubtlePressed = Color(0xFF134E4A),
            onPrimary = Color(0xFF042F2E),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF2DD4BF),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFF2DD4BF),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val TealLight = SerupaColors(
            primary = Color(0xFF0F766E),
            primaryHover = Color(0xFF115E59),
            primaryPressed = Color(0xFF134E4A),
            primarySubtle = Color(0xFFF0FDFA),
            primarySubtlePressed = Color(0xFFCCFBF1),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF0F766E),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0D9488),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val VioletDark = SerupaColors(
            primary = Color(0xFFA78BFA),
            primaryHover = Color(0xFFC4B5FD),
            primaryPressed = Color(0xFFDDD6FE),
            primarySubtle = Color(0xFF2E1065),
            primarySubtlePressed = Color(0xFF4C1D95),
            onPrimary = Color(0xFF2E1065),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFA78BFA),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFA78BFA),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFF0ABFC),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val VioletLight = SerupaColors(
            primary = Color(0xFF7C3AED),
            primaryHover = Color(0xFF6D28D9),
            primaryPressed = Color(0xFF5B21B6),
            primarySubtle = Color(0xFFF5F3FF),
            primarySubtlePressed = Color(0xFFEDE9FE),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFF7C3AED),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFF8B5CF6),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFFA21CAF),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
        val YellowDark = SerupaColors(
            primary = Color(0xFFFACC15),
            primaryHover = Color(0xFFFDE047),
            primaryPressed = Color(0xFFFEF08A),
            primarySubtle = Color(0xFF422006),
            primarySubtlePressed = Color(0xFF713F12),
            onPrimary = Color(0xFF422006),
            secondary = Color(0xFF3F3F46),
            secondaryHover = Color(0xFF52525B),
            secondaryPressed = Color(0xFF71717A),
            highlight = Color(0xFF3F3F46),
            pressed = Color(0xFF52525B),
            surface = Color(0xFF18181B),
            surfacePage = Color(0xFF09090B),
            surfaceMuted = Color(0xFF09090B),
            surfaceControl = Color(0xFF18181B),
            surfaceHover = Color(0xFF27272A),
            surfaceHoverRaised = Color(0xFF333338),
            surfaceRaised = Color(0xFF27272A),
            surfaceOverlay = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            disabledText = Color(0xFFA1A1AA),
            disabledSurface = Color(0xFF27272A),
            disabledBorder = Color(0xFF3F3F46),
            highlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF3F3F46),
            fieldBorderHover = Color(0xFF52525B),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFFA1A1AA),
            borderControlHover = Color(0xFFD4D4D8),
            borderControlPressed = Color(0xFFE4E4E7),
            fieldHover = Color(0xFF3F3F46),
            fieldPressed = Color(0xFF52525B),
            fieldRaised = Color(0xFF333338),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFFACC15),
            placeholder = Color(0xFFA1A1AA),
            overlay = Color(0xB309090B),
            pictureEdge = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFAFAFA),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textMutedShaded = Color(0xFFA1A1AA),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF52525B),
            borderOverlay = Color(0xFF52525B),
            focusRing = Color(0xFFFACC15),
            success = Color(0xFF22C55E),
            successSubtle = Color(0xFF052E16),
            successText = Color(0xFF86EFAC),
            successHover = Color(0xFF4ADE80),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFF14532D),
            successBorder = Color(0xFF166534),
            warning = Color(0xFFF59E0B),
            warningSubtle = Color(0xFF451A03),
            warningText = Color(0xFFFCD34D),
            warningHover = Color(0xFFFBBF24),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFF78350F),
            warningBorder = Color(0xFF92400E),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFF450A0A),
            dangerText = Color(0xFFFCA5A5),
            dangerSubtleHover = Color(0xFF7F1D1D),
            dangerBorder = Color(0xFF991B1B),
            info = Color(0xFF38BDF8),
            infoSubtle = Color(0xFF082F49),
            infoText = Color(0xFF7DD3FC),
            infoHover = Color(0xFF7DD3FC),
            onInfo = Color(0xFF082F49),
            infoSubtleHover = Color(0xFF0C4A6E),
            infoBorder = Color(0xFF075985),
            linkVisited = Color(0xFFC4B5FD),
            chart1 = Color(0xFF3B82F6),
            chart2 = Color(0xFFF97316),
            chart3 = Color(0xFFDB2777),
            chart4 = Color(0xFF06B6D4),
            chart5 = Color(0xFFA16207),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF8B5CF6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFF1E40AF),
            chartSeq2 = Color(0xFF2563EB),
            chartSeq3 = Color(0xFF3B82F6),
            chartSeq4 = Color(0xFF93C5FD),
            chartSeq5 = Color(0xFFDBEAFE),
            chartDiv1 = Color(0xFFFCA5A5),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFF991B1B),
            chartDiv4 = Color(0xFF3F3F46),
            chartDiv5 = Color(0xFF1E40AF),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF93C5FD),
            chartGrid = Color(0xFF3F3F46),
            chartAxis = Color(0xFFA1A1AA),
            chartLabel = Color(0xFFA1A1AA),
            chartGap = Color(0xFF18181B),
        )
        val YellowLight = SerupaColors(
            primary = Color(0xFFA16207),
            primaryHover = Color(0xFF854D0E),
            primaryPressed = Color(0xFF713F12),
            primarySubtle = Color(0xFFFEFCE8),
            primarySubtlePressed = Color(0xFFFEF9C3),
            onPrimary = Color(0xFFFFFFFF),
            secondary = Color(0xFFF4F4F5),
            secondaryHover = Color(0xFFE4E4E7),
            secondaryPressed = Color(0xFFD4D4D8),
            highlight = Color(0xFFF4F4F5),
            pressed = Color(0xFFD4D4D8),
            surface = Color(0xFFFFFFFF),
            surfacePage = Color(0xFFFFFFFF),
            surfaceMuted = Color(0xFFFAFAFA),
            surfaceControl = Color(0xFFFAFAFA),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceHoverRaised = Color(0xFFF4F4F5),
            surfaceRaised = Color(0xFFFFFFFF),
            surfaceOverlay = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFFAFAFA),
            disabledText = Color(0xFF71717A),
            disabledSurface = Color(0xFFF4F4F5),
            disabledBorder = Color(0xFFD4D4D8),
            highlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            borderControl = Color(0xFF71717A),
            borderControlHover = Color(0xFF52525B),
            borderControlPressed = Color(0xFF3F3F46),
            fieldHover = Color(0xFFF4F4F5),
            fieldPressed = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldAction = Color(0xFFA16207),
            placeholder = Color(0xFF71717A),
            overlay = Color(0x8018181B),
            pictureEdge = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textMutedShaded = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            borderOverlay = Color(0xFFE4E4E7),
            focusRing = Color(0xFFA16207),
            success = Color(0xFF16A34A),
            successSubtle = Color(0xFFF0FDF4),
            successText = Color(0xFF15803D),
            successHover = Color(0xFF22C55E),
            onSuccess = Color(0xFF052E16),
            successSubtleHover = Color(0xFFDCFCE7),
            successBorder = Color(0xFF86EFAC),
            warning = Color(0xFFD97706),
            warningSubtle = Color(0xFFFFFBEB),
            warningText = Color(0xFFB45309),
            warningHover = Color(0xFFF59E0B),
            onWarning = Color(0xFF451A03),
            warningSubtleHover = Color(0xFFFEF3C7),
            warningBorder = Color(0xFFFCD34D),
            danger = Color(0xFFDC2626),
            dangerHover = Color(0xFFB91C1C),
            dangerPressed = Color(0xFF991B1B),
            onDanger = Color(0xFFFFFFFF),
            dangerSubtle = Color(0xFFFEF2F2),
            dangerText = Color(0xFFB91C1C),
            dangerSubtleHover = Color(0xFFFEE2E2),
            dangerBorder = Color(0xFFFCA5A5),
            info = Color(0xFF0369A1),
            infoSubtle = Color(0xFFF0F9FF),
            infoText = Color(0xFF0369A1),
            infoHover = Color(0xFF075985),
            onInfo = Color(0xFFFFFFFF),
            infoSubtleHover = Color(0xFFE0F2FE),
            infoBorder = Color(0xFF7DD3FC),
            linkVisited = Color(0xFF6D28D9),
            chart1 = Color(0xFF1E40AF),
            chart2 = Color(0xFFEA580C),
            chart3 = Color(0xFF9D174D),
            chart4 = Color(0xFF0891B2),
            chart5 = Color(0xFF854D0E),
            chart6 = Color(0xFF0D9488),
            chart7 = Color(0xFF5B21B6),
            chart8 = Color(0xFFDC2626),
            chartSeq1 = Color(0xFFBFDBFE),
            chartSeq2 = Color(0xFF60A5FA),
            chartSeq3 = Color(0xFF2563EB),
            chartSeq4 = Color(0xFF1E40AF),
            chartSeq5 = Color(0xFF172554),
            chartDiv1 = Color(0xFFB91C1C),
            chartDiv2 = Color(0xFFEF4444),
            chartDiv3 = Color(0xFFFECACA),
            chartDiv4 = Color(0xFFF4F4F5),
            chartDiv5 = Color(0xFFBFDBFE),
            chartDiv6 = Color(0xFF3B82F6),
            chartDiv7 = Color(0xFF1D4ED8),
            chartGrid = Color(0xFFE4E4E7),
            chartAxis = Color(0xFF71717A),
            chartLabel = Color(0xFF52525B),
            chartGap = Color(0xFFFFFFFF),
        )
    }
}

/** The easings, CSS's cubic-bezier(): tween(SerupaTokens.duration150.toInt(), easing = SerupaEasing.easeEnter). */
object SerupaEasing {
    /** Constant speed: spinners, progress bars. */
    val easeLinear = CubicBezierEasing(0f, 0f, 1f, 1f)
    /** Something appearing: quick off the mark, then a long smooth landing. */
    val easeEnter = CubicBezierEasing(0.25f, 1f, 0.5f, 1f)
    /** Something leaving: at full speed from the first frame, then easing off as it fades, so a closed surface is out of the way at once. An ease-in starts slowly, and the first frames after a close are the ones people watch. */
    val easeExit = CubicBezierEasing(0.25f, 1f, 0.5f, 1f)
    /** Something that stays on screen and changes: a thumb sliding, a panel resizing, a color changing. A smooth start and finish. */
    val easeMove = CubicBezierEasing(0.65f, 0f, 0.35f, 1f)
    /** Something arriving at a new value or let go by the hand: a fill, a slide, a drawer dropped. Most of the travel at once, then a long glide to rest. */
    val easeSettle = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)
    /** Something small popping into place: a check mark, a count, a dot. Overshoots a touch, then settles. */
    val easePop = CubicBezierEasing(0.34f, 1.36f, 0.64f, 1f)
    /** Something the hand let go of mid-motion carrying on to rest: a drawer or carousel slide flicked. It starts at three times its average speed, so a settle timed as 3 × distance ÷ the hand’s speed starts exactly at that speed and slows from there (`settleTime()` in the components). */
    val easeFling = CubicBezierEasing(0.33f, 1f, 0.68f, 1f)
}

/** One layer of a drop shadow, as CSS draws it, in dp. */
data class SerupaShadowLayer(val color: Color, val x: Dp, val y: Dp, val blur: Dp, val spread: Dp)

/** The drop shadows, layer by layer, the first on top: Modifier.dropShadow(…) for each layer. */
object SerupaShadows {
    /** `shadow-2xs`. Hairline lift under flat controls. */
    val shadow2xs = listOf(SerupaShadowLayer(Color(0x0D000000), 0.dp, 1.dp, 0.dp, 0.dp))
    /** `shadow-xs`. Buttons and inputs (Button uses it). */
    val shadowXs = listOf(SerupaShadowLayer(Color(0x0D000000), 0.dp, 1.dp, 2.dp, 0.dp))
    /** `shadow-sm`. Cards at rest. */
    val shadowSm = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 1.dp, 3.dp, 0.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 1.dp, 2.dp, -1.dp))
    /** `shadow-md`. Raised cards, hover states. */
    val shadowMd = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 4.dp, 6.dp, -1.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 2.dp, 4.dp, -2.dp))
    /** `shadow-lg`. Dropdowns, popovers. */
    val shadowLg = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 10.dp, 15.dp, -3.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 4.dp, 6.dp, -4.dp))
    /** `shadow-xl`. Dialogs, floating panels. */
    val shadowXl = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 20.dp, 25.dp, -5.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 8.dp, 10.dp, -6.dp))
    /** `shadow-2xl`. Modals, the highest elevation. */
    val shadow2xl = listOf(SerupaShadowLayer(Color(0x40000000), 0.dp, 25.dp, 50.dp, -12.dp))
    /** `shadow-none`. Removes a shadow. */
    val shadowNone = listOf(SerupaShadowLayer(Color(0x00000000), 0.dp, 0.dp, 0.dp, 0.dp))
    /** Level 1, resting: something sitting on the page with a hairline lift, such as an outline card. */
    val elevationRest = listOf(SerupaShadowLayer(Color(0x0D000000), 0.dp, 1.dp, 2.dp, 0.dp))
    /** A part raised over the control or content it sits on: a slider thumb, the indicator of a segmented control, carousel arrows, a table head once the rows scroll under it. */
    val elevationPart = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 1.dp, 3.dp, 0.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 1.dp, 2.dp, -1.dp))
    /** Level 2, raised: a card raised by hover or on purpose, an item being dragged, a navbar once the page scrolls under it, a tooltip. */
    val elevationRaised = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 4.dp, 6.dp, -1.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 2.dp, 4.dp, -2.dp))
    /** Level 3, floating: menus, popovers, list boxes, date and time pickers, hover cards, toasts, a floating action button. */
    val elevationOverlay = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 10.dp, 15.dp, -3.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 4.dp, 6.dp, -4.dp))
    /** Level 4, modal: dialogs and drawers, over the overlay backdrop. */
    val elevationModal = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, 20.dp, 25.dp, -5.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, 8.dp, 10.dp, -6.dp))
    /** Level 4 for a panel against the bottom edge (a bottom sheet): `elevation-modal` cast upward, toward the page, from the same light. */
    val elevationModalUp = listOf(SerupaShadowLayer(Color(0x1A000000), 0.dp, -20.dp, 25.dp, -5.dp), SerupaShadowLayer(Color(0x1A000000), 0.dp, -8.dp, 10.dp, -6.dp))
    /** Level 4 for a panel against the right edge: `elevation-modal` cast to the left, toward the page. */
    val elevationModalLeft = listOf(SerupaShadowLayer(Color(0x1A000000), -20.dp, 0.dp, 25.dp, -5.dp), SerupaShadowLayer(Color(0x1A000000), -8.dp, 0.dp, 10.dp, -6.dp))
    /** Level 4 for a panel against the left edge: `elevation-modal` cast to the right, toward the page. */
    val elevationModalRight = listOf(SerupaShadowLayer(Color(0x1A000000), 20.dp, 0.dp, 25.dp, -5.dp), SerupaShadowLayer(Color(0x1A000000), 8.dp, 0.dp, 10.dp, -6.dp))
}

/** The type styles, in sp, without a font family: add the app's with .copy(fontFamily = …) (the web uses Inter). */
object SerupaType {
    /** `type-xs`: the whole 12px style in one class (Inter 400, line height 1rem). Same size as `text-xs`. */
    val typeXs = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-sm`: the whole 14px style in one class (Inter 400, line height 1.25rem). Same size as `text-sm`. */
    val typeSm = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-base`: the whole 16px style in one class (Inter 400, line height 1.5rem). Same size as `text-base`. */
    val typeBase = TextStyle(fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-lg`: the whole 18px style in one class (Inter 400, line height 1.75rem). Same size as `text-lg`. */
    val typeLg = TextStyle(fontSize = 18.sp, lineHeight = 28.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-xl`: the whole 20px style in one class (Inter 400, line height 1.75rem). Same size as `text-xl`. */
    val typeXl = TextStyle(fontSize = 20.sp, lineHeight = 28.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-2xl`: the whole 24px style in one class (Inter 400, line height 2rem). Same size as `text-2xl`. */
    val type2xl = TextStyle(fontSize = 24.sp, lineHeight = 32.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-3xl`: the whole 30px style in one class (Inter 400, line height 2.25rem). Same size as `text-3xl`. */
    val type3xl = TextStyle(fontSize = 30.sp, lineHeight = 36.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-4xl`: the whole 36px style in one class (Inter 400, line height 2.5rem). Same size as `text-4xl`. */
    val type4xl = TextStyle(fontSize = 36.sp, lineHeight = 40.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-5xl`: the whole 48px style in one class (Inter 400, line height 1). Same size as `text-5xl`. */
    val type5xl = TextStyle(fontSize = 48.sp, lineHeight = 48.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-6xl`: the whole 60px style in one class (Inter 400, line height 1). Same size as `text-6xl`. */
    val type6xl = TextStyle(fontSize = 60.sp, lineHeight = 60.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-7xl`: the whole 72px style in one class (Inter 400, line height 1). Same size as `text-7xl`. */
    val type7xl = TextStyle(fontSize = 72.sp, lineHeight = 72.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-8xl`: the whole 96px style in one class (Inter 400, line height 1). Same size as `text-8xl`. */
    val type8xl = TextStyle(fontSize = 96.sp, lineHeight = 96.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-9xl`: the whole 128px style in one class (Inter 400, line height 1). Same size as `text-9xl`. */
    val type9xl = TextStyle(fontSize = 128.sp, lineHeight = 128.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-display`: hero and marketing headlines (48px, 600, tracked tight, on a 52px line so two lines don't touch). */
    val typeDisplay = TextStyle(fontSize = 48.sp, lineHeight = 52.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-heading-1`: a page title. What a level 1 `Heading` renders. */
    val typeHeading1 = TextStyle(fontSize = 30.sp, lineHeight = 36.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-heading-2`: a section title. What a level 2 `Heading` renders. */
    val typeHeading2 = TextStyle(fontSize = 24.sp, lineHeight = 32.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-heading-3`: a subsection title. What a level 3 `Heading` renders. */
    val typeHeading3 = TextStyle(fontSize = 20.sp, lineHeight = 28.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-heading-4`: a group title, and Dialog and Drawer titles. What a level 4 `Heading` renders. */
    val typeHeading4 = TextStyle(fontSize = 18.sp, lineHeight = 28.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-title`: a card or list title, and Card and EmptyState titles. */
    val typeTitle = TextStyle(fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-body`: running text. */
    val typeBody = TextStyle(fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-body-sm`: UI text: controls, table cells, menus, descriptions. */
    val typeBodySm = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-label`: a form label (Field), table headers, tabs. */
    val typeLabel = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight(500), letterSpacing = 0.sp)
    /** `type-caption`: hints, timestamps, footnotes. Pair with `text-muted`. */
    val typeCaption = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
    /** `type-overline`: an eyebrow above a title. Uppercase and tracked widest. */
    val typeOverline = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight(600), letterSpacing = 0.sp)
    /** `type-code`: inline code and code blocks, in `font-mono`. */
    val typeCode = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight(400), letterSpacing = 0.sp)
}
