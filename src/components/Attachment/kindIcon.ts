// Each file kind's icon, shared by Attachment and FileUpload's rows so a file shows the same icon in both.
import * as icons from '../../material/builtin';
import type { AttachmentKind } from './attachmentKind';

export const KIND_ICONS = {
  pdf: icons.PictureAsPdf, image: icons.Image, sheet: icons.TableChart, doc: icons.Description, slides: icons.Slideshow,
  archive: icons.FolderZip, code: icons.Code, audio: icons.AudioFile, video: icons.Movie, other: icons.Draft,
} as const satisfies Record<AttachmentKind, unknown>;
