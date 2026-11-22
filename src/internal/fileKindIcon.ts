// Each file kind's icon, Attachment's (and so FileUpload's rows').
import * as icons from '../material/builtin';
import type { AttachmentKind } from './fileKind';

export const KIND_ICONS = {
  pdf: icons.PictureAsPdf, image: icons.Image, sheet: icons.TableChart, doc: icons.Description, slides: icons.Slideshow,
  archive: icons.FolderZip, code: icons.Code, audio: icons.AudioFile, video: icons.Movie, other: icons.Draft,
} as const satisfies Record<AttachmentKind, unknown>;
