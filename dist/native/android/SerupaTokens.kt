// Serupa 20.0.0: design tokens for native apps, generated from design-tokens/ (tools/build/native-tokens.mjs). Don't edit.

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
    /** The default padding and gap: inside a popover, between fields of a form. Popover, HoverCard, Tour and Accordion read it for their padding. 16px; 12px in the compact density. */
    val spaceContent = 16.dp
    /** The padding of a card at its default size (Card padding md). 20px; 12px in the compact density. */
    val spaceCard = 20.dp
    /** The block padding of a row in a table or a list (Table, List). 12px; 6px in the compact density. */
    val spaceRow = 12.dp
    /** The block padding of a denser row: a data grid's cell, a small table's row, a sidebar's item. 8px; 4px in the compact density. */
    val spaceItem = 8.dp
    /** The padding of a dialog, a drawer or a large card (Card padding lg), which read it for theirs. 24px; 16px in the compact density. */
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
    /** Long loops (1.2s). Decorative only. */
    const val duration1200 = 1200L
    /** No wait: `delay-0` cancels a delay set elsewhere. */
    const val delay0 = 0L
    /** One step of a stagger: the gap between list items arriving (`motion-stagger`). */
    const val delay50 = 50L
    /** A short offset between items that start one after another (75ms). */
    const val delay75 = 75L
    /** Short: a tooltip waits this long to close once the pointer leaves it. */
    const val delay100 = 100L
    /** The gap between the dots Loader's dots (`--loader-dots-stagger`). */
    const val delay150 = 150L
    /** An offset between items that start one after another. */
    const val delay200 = 200L
    /** A loading indicator waits this long before it shows, so a quick wait doesn't flash one. */
    const val delay300 = 300L
    /** A HoverCard waits this long before it opens; a loading indicator, once shown, stays at least this long. */
    const val delay500 = 500L
    /** An offset between items that start one after another. */
    const val delay700 = 700L
    /** An offset between items that start one after another; the longest wait (1s). */
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
    /** Alias. Brand fill: primary buttons, checked boxes, the selected day, a Switch that's on, a Progress bar, with `text-on-brand` (white) on it. Light themes: brand 600 or 700, the lightest with 4.5:1 for white text. Dark themes: the same shade, lightened as far as 3:1 on a raised dark card asks and always a touch, 0.02 of OKLCH lightness, while white text keeps 4.5:1 (blue-600 #2563eb becomes #2b6af2), so a button is the same color in both modes. Yellow is the exception: yellow 500 in light and yellow 400 in dark, under yellow-950 text, since a yellow dark enough for white text reads as brown; Yellow Light's fill takes a `border-brand`. Brand text, links, icons and lines are `text-brand`. More contrast: brand 800 with white text in light, brand 300 with brand-950 text in dark. */
    val surfaceBrand: Color,
    /** Alias. `surface-brand` under the pointer: one step darker, in light and dark themes alike (a dark theme's is lightened as much as its `surface-brand`). More contrast: brand 900 in light, brand 200 in dark. */
    val surfaceBrandHover: Color,
    /** Alias. `surface-brand` held down: one step past `surface-brand-hover`, darker in light and dark themes alike, so a held primary button reads as held without a shrink. More contrast: one step past its more-contrast hover where the scale goes on. */
    val surfaceBrandPressed: Color,
    /** Alias. A 1px edge just inside a `surface-brand` fill that has no text on it (a checked box, a Switch that's on, a Slider or Progress fill, a dot), for a theme whose fill is under 3:1 on the page: Yellow Light's bright yellow 500 takes a yellow 700 edge (4.9:1 on white, WCAG 1.4.11). Transparent in every other theme, where the fill passes by itself, so nothing is drawn. */
    val borderBrand: Color,
    /** Alias. Brand tint for selected rows and badges (brand 50 light, brand 950 dark). */
    val surfaceBrandSubtle: Color,
    /** Alias. `surface-brand-subtle` under the pointer: one brand step past it (100 in light, 900 in dark). */
    val surfaceBrandSubtleHover: Color,
    /** Alias. Pressed state of a fill in `surface-brand-subtle` (a secondary button held down): two brand steps past it (200 in light, 800 in dark; 900 in Red, Orange, Pink and Rose Dark, where 800 takes `text-brand-hover` under 4.5:1). `text-brand-hover` keeps 4.5:1 on it. */
    val surfaceBrandSubtlePressed: Color,
    /** Alias. Text and icons on `surface-brand` fills: white in light and dark themes, yellow 950 in Yellow Light and Yellow Dark, whose fills are bright (brand 950 in dark with more contrast, where the fill is brand 300). */
    val textOnBrand: Color,
    /** Alias. Brand text, links, icons, lines and borders: what `surface-brand` is as a fill, 4.5:1 as text on `surface`, `surface-sunken` and the tints. Light themes: the same shade as `surface-brand`; dark themes: brand 400, which a dark page needs for text. More contrast: brand 800 / brand 300, 7:1+ on `surface` and `surface-brand-subtle`. */
    val textBrand: Color,
    /** Alias. `text-brand` on hover: a link or a secondary button's text under the pointer. One step past `text-brand` (darker in light themes, lighter in dark). */
    val textBrandHover: Color,
    /** Alias. Secondary button fill; hover fill for outline and ghost buttons. */
    val surfaceSecondary: Color,
    /** Alias. Hover state of `surface-secondary`. */
    val surfaceSecondaryHover: Color,
    /** Alias. Pressed state of `surface-secondary`, a step past `surface-secondary-hover` (`surface-pressed` is the same gray as `surface-secondary-hover` in dark). */
    val surfaceSecondaryPressed: Color,
    /** The keyboard-highlighted item in a list: Menu items, Combobox and TimePicker options, the Sidebar's current page. In light the same zinc-100 as `surface-secondary` (about 1.1:1 on `surface`); in dark it shares `surface-secondary`'s zinc-700 (1.7:1 on `surface`, 1.4:1 on `surface-raised`), with no bar by default (`surface-highlight-indicator`). Text on it keeps 4.5:1. */
    val surfaceHighlight: Color,
    /** Alias. The fill while a row, tab, day or page button is held down (`:active`): one step past its hover. `text` keeps 7:1+ on it. */
    val surfacePressed: Color,
    /** Alias. Card, panel and bar background (white light, zinc-900 dark). The page behind them is `background`. */
    val surface: Color,
    /** Alias. The page itself: the <html> and <body> background, and a data-mode or data-theme section's. White in light, as `surface`; in dark zinc-950, a step below the zinc-900 cards, panels and bars on it, so they and every control (fields, buttons, SegmentedControl's track) sit lighter than the page. */
    val background: Color,
    /** Alias. Secondary panels, sidebars, table headers, filled Cards and wells: recessed, so a step below `surface` in both modes (zinc-50 under white in light, zinc-950 under zinc-900 in dark). A recess, so never the fill of something you press: controls use `control`. */
    val surfaceSunken: Color,
    /** Alias. The fill of a control that is its own surface rather than a field: SegmentedControl's track, FileUpload's drop zone. zinc-50 in light, as `surface-sunken`; in dark a step above the zinc-950 page (zinc-900), so a control is never darker than the surface it sits on. */
    val control: Color,
    /** Alias. `control` under the pointer: one step up. */
    val controlHover: Color,
    /** Alias. `control` while held down (FileUpload's drop zone): one step past `control-hover`. */
    val controlPressed: Color,
    /** Alias. `control` on a raised layer (a Dialog, Popover or Drawer): in dark the raised zinc-800, so the control is never darker than the layer under it. */
    val controlRaised: Color,
    /** Alias. `control-raised` under the pointer. */
    val controlRaisedHover: Color,
    /** Alias. `control-raised` while held down. */
    val controlRaisedPressed: Color,
    /** Alias. A disabled control's fill. */
    val controlDisabled: Color,
    /** Alias. A disabled control's fill on a raised layer. */
    val controlRaisedDisabled: Color,
    /** Alias. A row or item on `surface` under the pointer, a selected row, a striped row (List, Table, InlineEdit): a step off `surface` in every theme (zinc-100 light, the same as `surface-highlight`; zinc-800 dark). Gray text on it reads `text-secondary`. */
    val surfaceHover: Color,
    /** Alias. A List or InlineEdit row under the pointer or selected on a raised or floating surface (an elevated Card, a Popover, Dialog or Drawer): zinc-100 in light; in dark #333338, a step above zinc-800: zinc-800 and zinc-700 mixed half and half in sRGB (`color-mix(in srgb, zinc-800, zinc-700)`), so it sits between two palette steps rather than adding one, and muted text keeps 4.5:1 on it. Gray text on it reads `text-secondary`. */
    val surfaceRaisedHover: Color,
    /** Alias. A row or item on a raised layer while held down (`:active`): one step past `surface-raised-hover` (zinc-200 light, zinc-600 dark). */
    val surfaceRaisedPressed: Color,
    /** Alias. A raised card (Card `elevated`). One step up from `surface` in dark, where a shadow doesn't show. */
    val surfaceRaised: Color,
    /** Alias. Background of text inputs, selects and other form fields: white in light, zinc-800 in dark, a fill that sets a field apart from the page and cards around it. */
    val field: Color,
    /** Alias. Background of a read-only field: a step flatter than `field` (zinc-100 in light, zinc-900 in dark), so it reads as not editable while its `field-border` still outlines it. The same as `field-disabled`; gray text in it (a placeholder, an affix, a count) reads `text-secondary`, since `field-placeholder` is 4.4:1 on it. */
    val fieldReadonly: Color,
    /** Alias. A disabled field's fill: the same as `field-readonly` (zinc-100 in light, zinc-900 in dark); the muted text and `field-border-disabled` tell them apart. */
    val fieldDisabled: Color,
    /** Alias. `field-readonly` on a raised layer: in dark the layer's own zinc-800, as a readonly field sinks to the layer under it. */
    val fieldRaisedReadonly: Color,
    /** Alias. `field-disabled` on a raised layer. */
    val fieldRaisedDisabled: Color,
    /** Alias. The text, icon and mark of anything disabled, in place of fading it: the same neutral in every brand, so a disabled primary, danger or brand control reads as off, never as a faint version of itself. At least 3:1 on `surface-disabled` and the surfaces (4.5:1 with more contrast). */
    val textDisabled: Color,
    /** Alias. The fill of a disabled control that has one (a checked box, a switch's track, a slider's fill, the selected segment): a neutral a step off the page, whatever its color when on. */
    val surfaceDisabled: Color,
    /** Alias. The edge of a disabled control: a box, a track, a field's border. */
    val borderDisabled: Color,
    /** The 2px bar at the start of the highlighted item in a dropdown list: Menu items, and Combobox, Select, TimePicker, MentionInput and CommandPalette options. By default it is the same color as `surface-highlight` in every theme (change both together), so no bar shows and the gray fill alone marks the item: under the 3:1 WCAG 1.4.11 asks, a deliberate design choice, as with `field-border`. The item is also the one the screen reader names and the one Enter picks. More contrast (`data-contrast="more"` or the system setting) turns the bar `text`-dark, 3:1+ on `surface-highlight`, and forced colors outline the item in `Highlight`. */
    val surfaceHighlightIndicator: Color,
    /** Alias. Border of form fields (Input, Textarea, Select, Combobox, the pickers, Checkbox, Radio, PinInput) and SegmentedControl's track: a soft line, zinc-300 in light and zinc-700 in dark, a step lighter than the zinc-800 field. It is under the 3:1 WCAG 1.4.11 asks of a control's boundary, a deliberate design choice: the field also shows by its label above it, and in dark by its zinc-800 fill, hover and focus are stronger, and more contrast (`data-contrast="more"` or the system setting) brings back a 3:1+ border. Other controls' edges use `border-strong`. */
    val fieldBorder: Color,
    /** Alias. Field border on hover: the resting `field-border` one gray step stronger (zinc-400 in light, zinc-600 in dark), so the field answers the pointer without taking the accent, which stays for focus. */
    val fieldBorderHover: Color,
    /** Alias. Field border while held down (Checkbox's box, Radio's circle): `field-border-hover` one gray step stronger again (zinc-500 in light, zinc-500 in dark). */
    val fieldBorderPressed: Color,
    /** Alias. A disabled field's border: a step softer than `field-border` in light, so it reads as off. */
    val fieldBorderDisabled: Color,
    /** Alias. `field-border` on a raised layer: one step up in dark, as `field-raised` is. */
    val fieldBorderRaised: Color,
    /** Alias. `field-border-raised` under the pointer. */
    val fieldBorderRaisedHover: Color,
    /** Alias. `field-border-raised` while held down. */
    val fieldBorderRaisedPressed: Color,
    /** Alias. `field-border-disabled` on a raised layer. */
    val fieldBorderRaisedDisabled: Color,
    /** Alias. `field` on a raised or floating surface (Dialog, Drawer, Popover, an elevated Card, a bg-surface-raised or bg-surface-overlay panel), which set `--field` to it: white in light; in dark a step above the zinc-800 overlay (#333338, zinc-800 and zinc-700 mixed half and half, as `surface-raised-hover`), so a field in a dialog still stands out from it instead of matching it. `surface-raised-hover` and `surface-raised-pressed` already sit a step past it. */
    val fieldRaised: Color,
    /** Alias. An invalid field's border: `surface-danger` (red 600), 3:1+ on `field` and `surface`. Its own alias so a theme whose field fill is lighter can take a lighter red. */
    val fieldBorderInvalid: Color,
    /** Alias. `field-border-invalid` under the pointer: one step stronger. */
    val fieldBorderInvalidHover: Color,
    /** Alias. `field-border-invalid` while held down. */
    val fieldBorderInvalidPressed: Color,
    /** Alias. Placeholder text in form fields, and the other muted text inside a field: a prefix or suffix, a character count, the Caps Lock hint (4.5:1+ on `field` and `field-readonly`). Placeholders are hints, never labels. */
    val fieldPlaceholder: Color,
    /** Alias. `field-placeholder` in a field on a raised layer: in dark a step lighter, as zinc-400 is 4.07:1 on the zinc-700 `field-raised`. */
    val fieldRaisedPlaceholder: Color,
    /** Alias. The dimmed backdrop behind dialogs and drawers (zinc-900 at 50% in light themes, zinc-950 at 70% in dark). */
    val backdrop: Color,
    /** Alias. A hairline just inside a photo's edge (Image, Avatar), so a picture with a white or black background keeps its shape on a page of the same color: black at 10% in light themes, white at 10% in dark. */
    val borderPicture: Color,
    /** Alias. Contrasting blocks: tooltips, inverse banners. */
    val surfaceInverse: Color,
    /** Alias. Body text and headings on `surface`. */
    val text: Color,
    /** Alias. Secondary text, captions, placeholders (4.5:1+ on `surface` in every theme). */
    val textMuted: Color,
    /** Alias. Secondary text inside a shaded row (`surface-hover`, `surface-raised-hover`: hovered, selected or striped), where `text-muted` would fall under 4.5:1 on zinc-100: zinc-600 in light, `text-muted`'s zinc-400 in dark. 4.5:1+ on either fill in every theme. */
    val textSecondary: Color,
    /** Alias. Text on `surface-inverse`. */
    val textInverse: Color,
    /** Alias. Default borders and dividers: zinc-200 in light; zinc-800 in dark, a step off the zinc-900 cards and bars it outlines. A quiet line, never a control's boundary: those use `field-border` or `border-strong`. */
    val border: Color,
    /** Alias. Emphasized dividers and outlines. Form fields use `field-border` (softer by design; `border-strong` meets 3:1). */
    val borderStrong: Color,
    /** Alias. The empty part of a track: Switch off, Slider, Meter and Progress, at the level Apple's controls use (zinc-200 in light, zinc-700 in dark). The thumb, fill or edge on it carries the 3:1. */
    val track: Color,
    /** Alias. The empty part of a track under the pointer, a step darker than `track` (Switch off: zinc-300 in light, zinc-600 in dark). A fill, not an edge. */
    val trackHover: Color,
    /** Alias. The empty part of a track while held down, a step past `track-hover` (Switch off: zinc-500 in light, zinc-400 in dark). A fill, not an edge. */
    val trackPressed: Color,
    /** Alias. The edge of a top-layer surface (Menu, Popover, Dialog, Drawer, Toast, the picker lists), and the lines inside it. In dark it is one step stronger than `border`, so a menu stands off the page. */
    val borderRaised: Color,
    /** Alias. Keyboard focus outline, in the brand hue (3:1+ on `surface` in every theme). More contrast: brand 700 / brand 300. */
    val focusRing: Color,
    /** Alias. Success icons and fills (3:1): green-600 in light, a touch lighter in dark (#23a950), as every dark fill is (ADR-0026). For success text use `text-success`. */
    val surfaceSuccess: Color,
    /** Alias. Success alert / badge background. */
    val surfaceSuccessSubtle: Color,
    /** Alias. Success text on `surface`, `surface-sunken` and `surface-success-subtle` (4.5:1+ in every theme). */
    val textSuccess: Color,
    /** Alias. Hover / pressed state of `surface-success` fills; `text-on-success` stays 4.5:1+ on it. */
    val surfaceSuccessHover: Color,
    /** Alias. Text and icons on `surface-success` fills (4.5:1+ in every theme). */
    val textOnSuccess: Color,
    /** Alias. Hover fill of an interactive `surface-success-subtle` surface; `text-success` stays 4.5:1+ on it. */
    val surfaceSuccessSubtleHover: Color,
    /** Alias. Border of a success outline control or callout. */
    val borderSuccess: Color,
    /** Alias. Warning icons and fills: amber-600 in light, a touch lighter in dark (#e07d17); put dark text on it. For warning text use `text-warning`. */
    val surfaceWarning: Color,
    /** Alias. Warning alert / badge background. */
    val surfaceWarningSubtle: Color,
    /** Alias. Warning text on `surface`, `surface-sunken` and `surface-warning-subtle` (4.5:1+ in every theme). */
    val textWarning: Color,
    /** Alias. Hover / pressed state of `surface-warning` fills; `text-on-warning` stays 4.5:1+ on it. */
    val surfaceWarningHover: Color,
    /** Alias. Text and icons on `surface-warning` fills (4.5:1+ in every theme). */
    val textOnWarning: Color,
    /** Alias. Hover fill of an interactive `surface-warning-subtle` surface; `text-warning` stays 4.5:1+ on it. */
    val surfaceWarningSubtleHover: Color,
    /** Alias. Border of a warning outline control or callout. */
    val borderWarning: Color,
    /** Alias. Errors, destructive buttons; white text on it (4.5:1+): red-600 in light, a touch lighter in dark (#e22e2c). For error text use `text-danger`. */
    val surfaceDanger: Color,
    /** Alias. Hover / pressed state of `surface-danger`. */
    val surfaceDangerHover: Color,
    /** Alias. Pressed state of `surface-danger`: one step past `surface-danger-hover`; `text-on-danger` keeps 4.5:1 on it. */
    val surfaceDangerPressed: Color,
    /** Alias. Text and icons on `surface-danger` fills. */
    val textOnDanger: Color,
    /** Alias. Error alert / badge background. */
    val surfaceDangerSubtle: Color,
    /** Alias. Destructive text and icons on `surface`, `surface-danger-subtle` and its hover (5.3:1+ in every theme). */
    val textDanger: Color,
    /** Alias. Hover fill for destructive secondary, outline and ghost buttons. */
    val surfaceDangerSubtleHover: Color,
    /** Alias. Border of a destructive outline button. */
    val borderDanger: Color,
    /** Alias. Informational icons and fills (3:1), with white `text-on-info` text: sky-700 in light, the same shade lightened only as far as 3:1 on a raised dark card in dark (#1e77b0). For info text use `text-info`. */
    val surfaceInfo: Color,
    /** Alias. Info alert / badge background. */
    val surfaceInfoSubtle: Color,
    /** Alias. Info text on `surface`, `surface-sunken` and `surface-info-subtle` (4.5:1+ in every theme). */
    val textInfo: Color,
    /** Alias. Hover / pressed state of `surface-info` fills; `text-on-info` stays 4.5:1+ on it. */
    val surfaceInfoHover: Color,
    /** Alias. Text and icons on `surface-info` fills (4.5:1+ in every theme). */
    val textOnInfo: Color,
    /** Alias. Hover fill of an interactive `surface-info-subtle` surface; `text-info` stays 4.5:1+ on it. */
    val surfaceInfoSubtleHover: Color,
    /** Alias. Border of a info outline control or callout. */
    val borderInfo: Color,
    /** Alias. A visited link in reading content (Prose): a shade apart from primary, 4.5:1+ on `surface` and `surface-sunken` in every theme. */
    val textLinkVisited: Color,
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
            surfaceBrand = Color(0xFFBB5915),
            surfaceBrandHover = Color(0xFF984616),
            surfaceBrandPressed = Color(0xFF7E3B16),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF451A03),
            surfaceBrandSubtleHover = Color(0xFF78350F),
            surfaceBrandSubtlePressed = Color(0xFF92400E),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFFBBF24),
            textBrandHover = Color(0xFFFCD34D),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFFBBF24),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFB45309),
            surfaceBrandHover = Color(0xFF92400E),
            surfaceBrandPressed = Color(0xFF78350F),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFFFBEB),
            surfaceBrandSubtleHover = Color(0xFFFEF3C7),
            surfaceBrandSubtlePressed = Color(0xFFFDE68A),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFB45309),
            textBrandHover = Color(0xFF92400E),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFD97706),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF2B6AF2),
            surfaceBrandHover = Color(0xFF2255DF),
            surfaceBrandPressed = Color(0xFF2346B6),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF172554),
            surfaceBrandSubtleHover = Color(0xFF1E3A8A),
            surfaceBrandSubtlePressed = Color(0xFF1E40AF),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF60A5FA),
            textBrandHover = Color(0xFF93C5FD),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF60A5FA),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF2563EB),
            surfaceBrandHover = Color(0xFF1D4ED8),
            surfaceBrandPressed = Color(0xFF1E40AF),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFEFF6FF),
            surfaceBrandSubtleHover = Color(0xFFDBEAFE),
            surfaceBrandSubtlePressed = Color(0xFFBFDBFE),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF2563EB),
            textBrandHover = Color(0xFF1D4ED8),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF3B82F6),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF1B7B97),
            surfaceBrandHover = Color(0xFF1E647C),
            surfaceBrandPressed = Color(0xFF1D5469),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF083344),
            surfaceBrandSubtleHover = Color(0xFF164E63),
            surfaceBrandSubtlePressed = Color(0xFF155E75),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF22D3EE),
            textBrandHover = Color(0xFF67E8F9),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF22D3EE),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF0E7490),
            surfaceBrandHover = Color(0xFF155E75),
            surfaceBrandPressed = Color(0xFF164E63),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFECFEFF),
            surfaceBrandSubtleHover = Color(0xFFCFFAFE),
            surfaceBrandSubtlePressed = Color(0xFFA5F3FC),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF0E7490),
            textBrandHover = Color(0xFF155E75),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0891B2),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF18815F),
            surfaceBrandHover = Color(0xFF16674E),
            surfaceBrandPressed = Color(0xFF135642),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF022C22),
            surfaceBrandSubtleHover = Color(0xFF064E3B),
            surfaceBrandSubtlePressed = Color(0xFF065F46),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF34D399),
            textBrandHover = Color(0xFF6EE7B7),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF34D399),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF047857),
            surfaceBrandHover = Color(0xFF065F46),
            surfaceBrandPressed = Color(0xFF064E3B),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFECFDF5),
            surfaceBrandSubtleHover = Color(0xFFD1FAE5),
            surfaceBrandSubtlePressed = Color(0xFFA7F3D0),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF047857),
            textBrandHover = Color(0xFF065F46),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF059669),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFFB636C3),
            surfaceBrandHover = Color(0xFF9930A2),
            surfaceBrandPressed = Color(0xFF822E87),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF4A044E),
            surfaceBrandSubtleHover = Color(0xFF701A75),
            surfaceBrandSubtlePressed = Color(0xFF86198F),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFE879F9),
            textBrandHover = Color(0xFFF0ABFC),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFE879F9),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFA21CAF),
            surfaceBrandHover = Color(0xFF86198F),
            surfaceBrandPressed = Color(0xFF701A75),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFDF4FF),
            surfaceBrandSubtleHover = Color(0xFFFAE8FF),
            surfaceBrandSubtlePressed = Color(0xFFF5D0FE),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFA21CAF),
            textBrandHover = Color(0xFF86198F),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFD946EF),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF1F8643),
            surfaceBrandHover = Color(0xFF1E6B39),
            surfaceBrandPressed = Color(0xFF1B5932),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF052E16),
            surfaceBrandSubtleHover = Color(0xFF14532D),
            surfaceBrandSubtlePressed = Color(0xFF166534),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF4ADE80),
            textBrandHover = Color(0xFF86EFAC),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF4ADE80),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF15803D),
            surfaceBrandHover = Color(0xFF166534),
            surfaceBrandPressed = Color(0xFF14532D),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFF0FDF4),
            surfaceBrandSubtleHover = Color(0xFFDCFCE7),
            surfaceBrandSubtlePressed = Color(0xFFBBF7D0),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF15803D),
            textBrandHover = Color(0xFF166534),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF16A34A),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF5D5AFA),
            surfaceBrandHover = Color(0xFF504CDE),
            surfaceBrandPressed = Color(0xFF4443B6),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF1E1B4B),
            surfaceBrandSubtleHover = Color(0xFF312E81),
            surfaceBrandSubtlePressed = Color(0xFF3730A3),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF818CF8),
            textBrandHover = Color(0xFFA5B4FC),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF818CF8),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFF0ABFC),
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
            surfaceBrand = Color(0xFF4F46E5),
            surfaceBrandHover = Color(0xFF4338CA),
            surfaceBrandPressed = Color(0xFF3730A3),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFEEF2FF),
            surfaceBrandSubtleHover = Color(0xFFE0E7FF),
            surfaceBrandSubtlePressed = Color(0xFFC7D2FE),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF4F46E5),
            textBrandHover = Color(0xFF4338CA),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF6366F1),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFFA21CAF),
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
            surfaceBrand = Color(0xFF538219),
            surfaceBrandHover = Color(0xFF44681A),
            surfaceBrandPressed = Color(0xFF3B591A),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF1A2E05),
            surfaceBrandSubtleHover = Color(0xFF365314),
            surfaceBrandSubtlePressed = Color(0xFF3F6212),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFA3E635),
            textBrandHover = Color(0xFFBEF264),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFA3E635),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF4D7C0F),
            surfaceBrandHover = Color(0xFF3F6212),
            surfaceBrandPressed = Color(0xFF365314),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFF7FEE7),
            surfaceBrandSubtleHover = Color(0xFFECFCCB),
            surfaceBrandSubtlePressed = Color(0xFFD9F99D),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF4D7C0F),
            textBrandHover = Color(0xFF3F6212),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF4D7C0F),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFFC94817),
            surfaceBrandHover = Color(0xFFA13A1A),
            surfaceBrandPressed = Color(0xFF823318),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF431407),
            surfaceBrandSubtleHover = Color(0xFF7C2D12),
            surfaceBrandSubtlePressed = Color(0xFF7C2D12),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFFB923C),
            textBrandHover = Color(0xFFFDBA74),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFFB923C),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFC2410C),
            surfaceBrandHover = Color(0xFF9A3412),
            surfaceBrandPressed = Color(0xFF7C2D12),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFFF7ED),
            surfaceBrandSubtleHover = Color(0xFFFFEDD5),
            surfaceBrandSubtlePressed = Color(0xFFFED7AA),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFC2410C),
            textBrandHover = Color(0xFF9A3412),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEA580C),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFFD02F6B),
            surfaceBrandHover = Color(0xFFAE2B5B),
            surfaceBrandPressed = Color(0xFF932950),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF500724),
            surfaceBrandSubtleHover = Color(0xFF831843),
            surfaceBrandSubtlePressed = Color(0xFF831843),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFF472B6),
            textBrandHover = Color(0xFFF9A8D4),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFF472B6),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFBE185D),
            surfaceBrandHover = Color(0xFF9D174D),
            surfaceBrandPressed = Color(0xFF831843),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFDF2F8),
            surfaceBrandSubtleHover = Color(0xFFFCE7F3),
            surfaceBrandSubtlePressed = Color(0xFFFBCFE8),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFBE185D),
            textBrandHover = Color(0xFF9D174D),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEC4899),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF9A3CF2),
            surfaceBrandHover = Color(0xFF842CD6),
            surfaceBrandPressed = Color(0xFF712AAF),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF3B0764),
            surfaceBrandSubtleHover = Color(0xFF581C87),
            surfaceBrandSubtlePressed = Color(0xFF6B21A8),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFC084FC),
            textBrandHover = Color(0xFFD8B4FE),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFC084FC),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFF0ABFC),
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
            surfaceBrand = Color(0xFF9333EA),
            surfaceBrandHover = Color(0xFF7E22CE),
            surfaceBrandPressed = Color(0xFF6B21A8),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFAF5FF),
            surfaceBrandSubtleHover = Color(0xFFF3E8FF),
            surfaceBrandSubtlePressed = Color(0xFFE9D5FF),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF9333EA),
            textBrandHover = Color(0xFF7E22CE),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFA855F7),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFFA21CAF),
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
            surfaceBrand = Color(0xFFD13832),
            surfaceBrandHover = Color(0xFFB0342F),
            surfaceBrandPressed = Color(0xFF95322F),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF450A0A),
            surfaceBrandSubtleHover = Color(0xFF7F1D1D),
            surfaceBrandSubtlePressed = Color(0xFF7F1D1D),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFF87171),
            textBrandHover = Color(0xFFFCA5A5),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFF87171),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFB91C1C),
            surfaceBrandHover = Color(0xFF991B1B),
            surfaceBrandPressed = Color(0xFF7F1D1D),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFEF2F2),
            surfaceBrandSubtleHover = Color(0xFFFEE2E2),
            surfaceBrandSubtlePressed = Color(0xFFFECACA),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFB91C1C),
            textBrandHover = Color(0xFF991B1B),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFEF4444),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFFD4304D),
            surfaceBrandHover = Color(0xFFB42C49),
            surfaceBrandPressed = Color(0xFF9C2A47),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF4C0519),
            surfaceBrandSubtleHover = Color(0xFF881337),
            surfaceBrandSubtlePressed = Color(0xFF881337),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFFB7185),
            textBrandHover = Color(0xFFFDA4AF),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFFB7185),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFBE123C),
            surfaceBrandHover = Color(0xFF9F1239),
            surfaceBrandPressed = Color(0xFF881337),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFFFF1F2),
            surfaceBrandSubtleHover = Color(0xFFFFE4E6),
            surfaceBrandSubtlePressed = Color(0xFFFECDD3),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFBE123C),
            textBrandHover = Color(0xFF9F1239),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFF43F5E),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF1E77B0),
            surfaceBrandHover = Color(0xFF1D6693),
            surfaceBrandPressed = Color(0xFF1D577C),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF082F49),
            surfaceBrandSubtleHover = Color(0xFF0C4A6E),
            surfaceBrandSubtlePressed = Color(0xFF075985),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF38BDF8),
            textBrandHover = Color(0xFF7DD3FC),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF38BDF8),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF0369A1),
            surfaceBrandHover = Color(0xFF075985),
            surfaceBrandPressed = Color(0xFF0C4A6E),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFF0F9FF),
            surfaceBrandSubtleHover = Color(0xFFE0F2FE),
            surfaceBrandSubtlePressed = Color(0xFFBAE6FD),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF0369A1),
            textBrandHover = Color(0xFF075985),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0284C7),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF1E7E76),
            surfaceBrandHover = Color(0xFF1C6661),
            surfaceBrandPressed = Color(0xFF1C5551),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF042F2E),
            surfaceBrandSubtleHover = Color(0xFF134E4A),
            surfaceBrandSubtlePressed = Color(0xFF115E59),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF2DD4BF),
            textBrandHover = Color(0xFF5EEAD4),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFF2DD4BF),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFF0F766E),
            surfaceBrandHover = Color(0xFF115E59),
            surfaceBrandPressed = Color(0xFF134E4A),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFF0FDFA),
            surfaceBrandSubtleHover = Color(0xFFCCFBF1),
            surfaceBrandSubtlePressed = Color(0xFF99F6E4),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF0F766E),
            textBrandHover = Color(0xFF115E59),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF0D9488),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
            surfaceBrand = Color(0xFF8648FA),
            surfaceBrandHover = Color(0xFF7737E5),
            surfaceBrandPressed = Color(0xFF642FC2),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF2E1065),
            surfaceBrandSubtleHover = Color(0xFF4C1D95),
            surfaceBrandSubtlePressed = Color(0xFF5B21B6),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFFA78BFA),
            textBrandHover = Color(0xFFC4B5FD),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFA78BFA),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFF0ABFC),
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
            surfaceBrand = Color(0xFF7C3AED),
            surfaceBrandHover = Color(0xFF6D28D9),
            surfaceBrandPressed = Color(0xFF5B21B6),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFFF5F3FF),
            surfaceBrandSubtleHover = Color(0xFFEDE9FE),
            surfaceBrandSubtlePressed = Color(0xFFDDD6FE),
            textOnBrand = Color(0xFFFFFFFF),
            textBrand = Color(0xFF7C3AED),
            textBrandHover = Color(0xFF6D28D9),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFF8B5CF6),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFFA21CAF),
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
            surfaceBrand = Color(0xFFFACC15),
            surfaceBrandHover = Color(0xFFFDE047),
            surfaceBrandPressed = Color(0xFFFEF08A),
            borderBrand = Color(0x00000000),
            surfaceBrandSubtle = Color(0xFF422006),
            surfaceBrandSubtleHover = Color(0xFF713F12),
            surfaceBrandSubtlePressed = Color(0xFF854D0E),
            textOnBrand = Color(0xFF422006),
            textBrand = Color(0xFFFACC15),
            textBrandHover = Color(0xFFFDE047),
            surfaceSecondary = Color(0xFF3F3F46),
            surfaceSecondaryHover = Color(0xFF52525B),
            surfaceSecondaryPressed = Color(0xFF71717A),
            surfaceHighlight = Color(0xFF3F3F46),
            surfacePressed = Color(0xFF3F3F46),
            surface = Color(0xFF18181B),
            background = Color(0xFF09090B),
            surfaceSunken = Color(0xFF09090B),
            control = Color(0xFF18181B),
            controlHover = Color(0xFF27272A),
            controlPressed = Color(0xFF3F3F46),
            controlRaised = Color(0xFF27272A),
            controlRaisedHover = Color(0xFF3F3F46),
            controlRaisedPressed = Color(0xFF52525B),
            controlDisabled = Color(0xFF18181B),
            controlRaisedDisabled = Color(0xFF27272A),
            surfaceHover = Color(0xFF27272A),
            surfaceRaisedHover = Color(0xFF3F3F46),
            surfaceRaisedPressed = Color(0xFF52525B),
            surfaceRaised = Color(0xFF27272A),
            field = Color(0xFF27272A),
            fieldReadonly = Color(0xFF18181B),
            fieldDisabled = Color(0xFF18181B),
            fieldRaisedReadonly = Color(0xFF27272A),
            fieldRaisedDisabled = Color(0xFF27272A),
            textDisabled = Color(0xFFA1A1AA),
            surfaceDisabled = Color(0xFF27272A),
            borderDisabled = Color(0xFF3F3F46),
            surfaceHighlightIndicator = Color(0xFF3F3F46),
            fieldBorder = Color(0xFF52525B),
            fieldBorderHover = Color(0xFF71717A),
            fieldBorderPressed = Color(0xFFA1A1AA),
            fieldBorderDisabled = Color(0xFF3F3F46),
            fieldBorderRaised = Color(0xFF71717A),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFFD4D4D8),
            fieldBorderRaisedDisabled = Color(0xFF52525B),
            fieldRaised = Color(0xFF3F3F46),
            fieldBorderInvalid = Color(0xFFEF4444),
            fieldBorderInvalidHover = Color(0xFFF87171),
            fieldBorderInvalidPressed = Color(0xFFFCA5A5),
            fieldPlaceholder = Color(0xFFA1A1AA),
            fieldRaisedPlaceholder = Color(0xFFD4D4D8),
            backdrop = Color(0xB309090B),
            borderPicture = Color(0x1AFFFFFF),
            surfaceInverse = Color(0xFFFFFFFF),
            text = Color(0xFFFAFAFA),
            textMuted = Color(0xFFA1A1AA),
            textSecondary = Color(0xFFD4D4D8),
            textInverse = Color(0xFF18181B),
            border = Color(0xFF27272A),
            borderStrong = Color(0xFF3F3F46),
            track = Color(0xFF3F3F46),
            trackHover = Color(0xFF52525B),
            trackPressed = Color(0xFFA1A1AA),
            borderRaised = Color(0xFF3F3F46),
            focusRing = Color(0xFFFACC15),
            surfaceSuccess = Color(0xFF23A950),
            surfaceSuccessSubtle = Color(0xFF052E16),
            textSuccess = Color(0xFF86EFAC),
            surfaceSuccessHover = Color(0xFF2ECC64),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFF14532D),
            borderSuccess = Color(0xFF166534),
            surfaceWarning = Color(0xFFE07D17),
            surfaceWarningSubtle = Color(0xFF451A03),
            textWarning = Color(0xFFFCD34D),
            surfaceWarningHover = Color(0xFFFCA41D),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFF78350F),
            borderWarning = Color(0xFF92400E),
            surfaceDanger = Color(0xFFE22E2C),
            surfaceDangerHover = Color(0xFFBF2422),
            surfaceDangerPressed = Color(0xFF9F2220),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFF450A0A),
            textDanger = Color(0xFFFCA5A5),
            surfaceDangerSubtleHover = Color(0xFF7F1D1D),
            borderDanger = Color(0xFF991B1B),
            surfaceInfo = Color(0xFF1E77B0),
            surfaceInfoSubtle = Color(0xFF082F49),
            textInfo = Color(0xFF7DD3FC),
            surfaceInfoHover = Color(0xFF1D6693),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFF0C4A6E),
            borderInfo = Color(0xFF075985),
            textLinkVisited = Color(0xFFC4B5FD),
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
            surfaceBrand = Color(0xFFEAB308),
            surfaceBrandHover = Color(0xFFD9A500),
            surfaceBrandPressed = Color(0xFFCA8A04),
            borderBrand = Color(0xFFA16207),
            surfaceBrandSubtle = Color(0xFFFEFCE8),
            surfaceBrandSubtleHover = Color(0xFFFEF9C3),
            surfaceBrandSubtlePressed = Color(0xFFFEF08A),
            textOnBrand = Color(0xFF422006),
            textBrand = Color(0xFFA16207),
            textBrandHover = Color(0xFF854D0E),
            surfaceSecondary = Color(0xFFF4F4F5),
            surfaceSecondaryHover = Color(0xFFE4E4E7),
            surfaceSecondaryPressed = Color(0xFFD4D4D8),
            surfaceHighlight = Color(0xFFF4F4F5),
            surfacePressed = Color(0xFFE4E4E7),
            surface = Color(0xFFFFFFFF),
            background = Color(0xFFFFFFFF),
            surfaceSunken = Color(0xFFFAFAFA),
            control = Color(0xFFFAFAFA),
            controlHover = Color(0xFFF4F4F5),
            controlPressed = Color(0xFFE4E4E7),
            controlRaised = Color(0xFFFAFAFA),
            controlRaisedHover = Color(0xFFF4F4F5),
            controlRaisedPressed = Color(0xFFE4E4E7),
            controlDisabled = Color(0xFFF4F4F5),
            controlRaisedDisabled = Color(0xFFF4F4F5),
            surfaceHover = Color(0xFFF4F4F5),
            surfaceRaisedHover = Color(0xFFF4F4F5),
            surfaceRaisedPressed = Color(0xFFE4E4E7),
            surfaceRaised = Color(0xFFFFFFFF),
            field = Color(0xFFFFFFFF),
            fieldReadonly = Color(0xFFF4F4F5),
            fieldDisabled = Color(0xFFF4F4F5),
            fieldRaisedReadonly = Color(0xFFF4F4F5),
            fieldRaisedDisabled = Color(0xFFF4F4F5),
            textDisabled = Color(0xFF71717A),
            surfaceDisabled = Color(0xFFF4F4F5),
            borderDisabled = Color(0xFFD4D4D8),
            surfaceHighlightIndicator = Color(0xFFF4F4F5),
            fieldBorder = Color(0xFFD4D4D8),
            fieldBorderHover = Color(0xFFA1A1AA),
            fieldBorderPressed = Color(0xFF71717A),
            fieldBorderDisabled = Color(0xFFE4E4E7),
            fieldBorderRaised = Color(0xFFD4D4D8),
            fieldBorderRaisedHover = Color(0xFFA1A1AA),
            fieldBorderRaisedPressed = Color(0xFF71717A),
            fieldBorderRaisedDisabled = Color(0xFFE4E4E7),
            fieldRaised = Color(0xFFFFFFFF),
            fieldBorderInvalid = Color(0xFFDC2626),
            fieldBorderInvalidHover = Color(0xFFB91C1C),
            fieldBorderInvalidPressed = Color(0xFF991B1B),
            fieldPlaceholder = Color(0xFF71717A),
            fieldRaisedPlaceholder = Color(0xFF71717A),
            backdrop = Color(0x8018181B),
            borderPicture = Color(0x1A000000),
            surfaceInverse = Color(0xFF18181B),
            text = Color(0xFF18181B),
            textMuted = Color(0xFF71717A),
            textSecondary = Color(0xFF52525B),
            textInverse = Color(0xFFFFFFFF),
            border = Color(0xFFE4E4E7),
            borderStrong = Color(0xFFD4D4D8),
            track = Color(0xFFE4E4E7),
            trackHover = Color(0xFFD4D4D8),
            trackPressed = Color(0xFF71717A),
            borderRaised = Color(0xFFE4E4E7),
            focusRing = Color(0xFFA16207),
            surfaceSuccess = Color(0xFF16A34A),
            surfaceSuccessSubtle = Color(0xFFF0FDF4),
            textSuccess = Color(0xFF15803D),
            surfaceSuccessHover = Color(0xFF22C55E),
            textOnSuccess = Color(0xFF052E16),
            surfaceSuccessSubtleHover = Color(0xFFDCFCE7),
            borderSuccess = Color(0xFF86EFAC),
            surfaceWarning = Color(0xFFD97706),
            surfaceWarningSubtle = Color(0xFFFFFBEB),
            textWarning = Color(0xFFB45309),
            surfaceWarningHover = Color(0xFFF59E0B),
            textOnWarning = Color(0xFF451A03),
            surfaceWarningSubtleHover = Color(0xFFFEF3C7),
            borderWarning = Color(0xFFFCD34D),
            surfaceDanger = Color(0xFFDC2626),
            surfaceDangerHover = Color(0xFFB91C1C),
            surfaceDangerPressed = Color(0xFF991B1B),
            textOnDanger = Color(0xFFFFFFFF),
            surfaceDangerSubtle = Color(0xFFFEF2F2),
            textDanger = Color(0xFFB91C1C),
            surfaceDangerSubtleHover = Color(0xFFFEE2E2),
            borderDanger = Color(0xFFFCA5A5),
            surfaceInfo = Color(0xFF0369A1),
            surfaceInfoSubtle = Color(0xFFF0F9FF),
            textInfo = Color(0xFF0369A1),
            surfaceInfoHover = Color(0xFF075985),
            textOnInfo = Color(0xFFFFFFFF),
            surfaceInfoSubtleHover = Color(0xFFE0F2FE),
            borderInfo = Color(0xFF7DD3FC),
            textLinkVisited = Color(0xFF6D28D9),
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
