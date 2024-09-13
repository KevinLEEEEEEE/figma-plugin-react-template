import { EventHandler } from '@create-figma-plugin/utilities'

export interface TranslateHandler extends EventHandler {
    name: 'TRANSLATE'
    handler: () => void
}