import type { DOMHelper } from '../parameter/DOMHelper';
import type { PluginEvent } from '../event/PluginEvent';
import type { PluginState } from '../pluginState/PluginState';
import type { EditorPlugin } from './EditorPlugin';
import type { ClipboardData } from '../parameter/ClipboardData';
import type { PasteType } from '../enum/PasteType';
import type { DOMEventRecord } from '../parameter/DOMEventRecord';
import type { Snapshot } from '../parameter/Snapshot';
import type { EntityState } from '../parameter/FormatContentModelContext';
import type { DarkColorHandler } from '../context/DarkColorHandler';
import type { ContentModelDocument } from '../group/ContentModelDocument';
import type { DOMSelection } from '../selection/DOMSelection';
import type { DomToModelOption } from '../context/DomToModelOption';
import type { DomToModelSettings } from '../context/DomToModelSettings';
import type { EditorContext } from '../context/EditorContext';
import type { EditorEnvironment } from '../parameter/EditorEnvironment';
import type { ModelToDomOption } from '../context/ModelToDomOption';
import type { ModelToDomSettings, OnNodeCreated } from '../context/ModelToDomSettings';
import type { TrustedHTMLHandler } from '../parameter/TrustedHTMLHandler';
import type { Rect } from '../parameter/Rect';
import type {
    ContentModelFormatter,
    FormatContentModelOptions,
} from '../parameter/FormatContentModelOptions';

/**
 * Create a EditorContext object used by ContentModel API
 * @param core The EditorCore object
 * @param saveIndex True to allow saving index info into node using domIndexer, otherwise false
 */
export type CreateEditorContext = (core: EditorCore, saveIndex: boolean) => EditorContext;

/**
 * Create Content Model from DOM tree in this editor
 * @param core The EditorCore object
 * @param option The option to customize the behavior of DOM to Content Model conversion
 * @param selectionOverride When passed, use this selection range instead of current selection in editor
 */
export type CreateContentModel = (
    core: EditorCore,
    option?: DomToModelOption,
    selectionOverride?: DOMSelection
) => ContentModelDocument;

/**
 * Get current DOM selection from editor
 * @param core The EditorCore object
 */
export type GetDOMSelection = (core: EditorCore) => DOMSelection | null;

/**
 * Set content with content model. This is the replacement of core API getSelectionRangeEx
 * @param core The EditorCore object
 * @param model The content model to set
 * @param option Additional options to customize the behavior of Content Model to DOM conversion
 * @param onNodeCreated An optional callback that will be called when a DOM node is created
 */
export type SetContentModel = (
    core: EditorCore,
    model: ContentModelDocument,
    option?: ModelToDomOption,
    onNodeCreated?: OnNodeCreated
) => DOMSelection | null;

/**
 * Set current DOM selection from editor. This is the replacement of core API select
 * @param core The EditorCore object
 * @param selection The selection to set
 * @param skipSelectionChangedEvent @param Pass true to skip triggering a SelectionChangedEvent
 */
export type SetDOMSelection = (
    core: EditorCore,
    selection: DOMSelection | null,
    skipSelectionChangedEvent?: boolean
) => void;

/**
 * Set a new logical root (most likely due to focus change)
 * @param core The EditorCore object
 * @param logicalRoot The new logical root (has to be child of physicalRoot or null to use physicalRoot as logical root)
 */
export type SetLogicalRoot = (core: EditorCore, logicalRoot: HTMLDivElement | null) => void;

/**
 * The general API to do format change with Content Model
 * It will grab a Content Model for current editor content, and invoke a callback function
 * to do format change. Then according to the return value, write back the modified content model into editor.
 * If there is cached model, it will be used and updated.
 * @param core The EditorCore object
 * @param formatter Formatter function, see ContentModelFormatter
 * @param options More options, see FormatContentModelOptions
 */
export type FormatContentModel = (
    core: EditorCore,
    formatter: ContentModelFormatter,
    options?: FormatContentModelOptions
) => void;

/**
 * Switch the Shadow Edit mode of editor On/Off
 * @param core The EditorCore object
 * @param isOn True to switch On, False to switch Off
 */
export type SwitchShadowEdit = (core: EditorCore, isOn: boolean) => void;

/**
 * Trigger a plugin event
 * @param core The EditorCore object
 * @param pluginEvent The event object to trigger
 * @param broadcast Set to true to skip the shouldHandleEventExclusively check
 */
export type TriggerEvent = (core: EditorCore, pluginEvent: PluginEvent, broadcast: boolean) => void;

/**
 * Add an undo snapshot to current undo snapshot stack
 * @param core The EditorCore object
 * @param canUndoByBackspace True if this action can be undone when user press Backspace key (aka Auto Complete).
 * @param entityStates @optional Entity states related to this snapshot.
 * Each entity state will cause an EntityOperation event with operation = EntityOperation.UpdateEntityState
 * when undo/redo to this snapshot
 */
export type AddUndoSnapshot = (
    core: EditorCore,
    canUndoByBackspace: boolean,
    entityStates?: EntityState[]
) => Snapshot | null;

/**
 * Retrieves the rect of the visible viewport of the editor.
 * @param core The EditorCore object
 */
export type GetVisibleViewport = (core: EditorCore) => Rect | null;

/**
 * Check if the editor has focus now
 * @param core The EditorCore object
 * @returns True if the editor has focus, otherwise false
 */
export type HasFocus = (core: EditorCore) => boolean;

/**
 * Focus to editor. If there is a cached selection range, use it as current selection
 * @param core The EditorCore object
 */
export type Focus = (core: EditorCore) => void;

/**
 * Attach a DOM event to the editor content DIV
 * @param core The EditorCore object
 * @param eventMap A map from event name to its handler
 */
export type AttachDomEvent = (
    core: EditorCore,
    eventMap: Record<string, DOMEventRecord>
) => () => void;

/**
 * Restore an undo snapshot into editor
 * @param core The EditorCore object
 * @param step Steps to move, can be 0, positive or negative
 */
export type RestoreUndoSnapshot = (core: EditorCore, snapshot: Snapshot) => void;

/**
 * Paste into editor using a clipboardData object
 * @param core The EditorCore object.
 * @param clipboardData Clipboard data retrieved from clipboard
 * @param pasteType Type of content to paste. @default normal
 */
export type Paste = (core: EditorCore, clipboardData: ClipboardData, pasteType: PasteType) => void;

/**
 * The interface for the map of core API for Editor.
 * Editor can call call API from this map under EditorCore object
 */
export interface CoreApiMap {
    /**
     * Create a EditorContext object used by ContentModel API
     * @param core The EditorCore object
     * @param saveIndex True to allow saving index info into node using domIndexer, otherwise false
     */
    createEditorContext: CreateEditorContext;

    /**
     * Create Content Model from DOM tree in this editor
     * @param core The EditorCore object
     * @param option The option to customize the behavior of DOM to Content Model conversion
     */
    createContentModel: CreateContentModel;

    /**
     * Get current DOM selection from editor
     * @param core The EditorCore object
     */
    getDOMSelection: GetDOMSelection;

    /**
     * Set content with content model
     * @param core The EditorCore object
     * @param model The content model to set
     * @param option Additional options to customize the behavior of Content Model to DOM conversion
     */
    setContentModel: SetContentModel;

    /**
     * Set current DOM selection from editor. This is the replacement of core API select
     * @param core The EditorCore object
     * @param selection The selection to set
     * @param skipSelectionChangedEvent @param Pass true to skip triggering a SelectionChangedEvent
     */
    setDOMSelection: SetDOMSelection;

    /**
     * Set a new logical root (most likely due to focus change)
     * @param core The StandaloneEditorCore object
     * @param logicalRoot The new logical root (has to be child of physicalRoot)
     */
    setLogicalRoot: SetLogicalRoot;

    /**
     * The general API to do format change with Content Model
     * It will grab a Content Model for current editor content, and invoke a callback function
     * to do format change. Then according to the return value, write back the modified content model into editor.
     * If there is cached model, it will be used and updated.
     * @param core The EditorCore object
     * @param formatter Formatter function, see ContentModelFormatter
     * @param options More options, see FormatContentModelOptions
     */
    formatContentModel: FormatContentModel;

    /**
     * Switch the Shadow Edit mode of editor On/Off
     * @param core The EditorCore object
     * @param isOn True to switch On, False to switch Off
     */
    switchShadowEdit: SwitchShadowEdit;

    /**
     * Retrieves the rect of the visible viewport of the editor.
     * @param core The EditorCore object
     */
    getVisibleViewport: GetVisibleViewport;

    /**
     * Check if the editor has focus now
     * @param core The EditorCore object
     * @returns True if the editor has focus, otherwise false
     */
    hasFocus: HasFocus;

    /**
     * Focus to editor. If there is a cached selection range, use it as current selection
     * @param core The EditorCore object
     */
    focus: Focus;

    /**
     * Add an undo snapshot to current undo snapshot stack
     * @param core The EditorCore object
     * @param canUndoByBackspace True if this action can be undone when user press Backspace key (aka Auto Complete).
     * @param entityStates @optional Entity states related to this snapshot.
     * Each entity state will cause an EntityOperation event with operation = EntityOperation.UpdateEntityState
     * when undo/redo to this snapshot
     */
    addUndoSnapshot: AddUndoSnapshot;

    /**
     * Restore an undo snapshot into editor
     * @param core The editor core object
     * @param step Steps to move, can be 0, positive or negative
     */
    restoreUndoSnapshot: RestoreUndoSnapshot;

    /**
     * Attach a DOM event to the editor content DIV
     * @param core The EditorCore object
     * @param eventMap A map from event name to its handler
     */
    attachDomEvent: AttachDomEvent;

    /**
     * Trigger a plugin event
     * @param core The EditorCore object
     * @param pluginEvent The event object to trigger
     * @param broadcast Set to true to skip the shouldHandleEventExclusively check
     */
    triggerEvent: TriggerEvent;

    /**
     * Paste into editor using a clipboardData object
     * @param editor The editor to paste content into
     * @param clipboardData Clipboard data retrieved from clipboard
     * @param pasteType Type of content to paste. @default normal
     */
    paste: Paste;
}

/**
 * Represents the core data structure of an editor
 */
export interface EditorCore extends PluginState {
    /**
     * The root DIV element of this editor (formerly contentDiv)
     */
    readonly physicalRoot: HTMLDivElement;

    /**
     * The content DIV element that operations should be applied to
     * By default, the logical root is the same as the physical root,
     * but if nested editors are used, the logical root changes to that of the inner editor
     */
    logicalRoot: HTMLDivElement;

    /**
     * Core API map of this editor
     */
    readonly api: CoreApiMap;

    /**
     * Original API map of this editor. Overridden core API can use API from this map to call the original version of core API.
     */
    readonly originalApi: CoreApiMap;

    /**
     * An array of editor plugins.
     */
    readonly plugins: EditorPlugin[];

    /**
     * Settings used by DOM to Content Model conversion
     */
    readonly domToModelSettings: ContentModelSettings<DomToModelOption, DomToModelSettings>;

    /**
     * Settings used by Content Model to DOM conversion
     */
    readonly modelToDomSettings: ContentModelSettings<ModelToDomOption, ModelToDomSettings>;

    /**
     * Editor running environment
     */
    readonly environment: EditorEnvironment;

    /**
     * Dark model handler for the editor, used for variable-based solution.
     * If keep it null, editor will still use original dataset-based dark mode solution.
     */
    readonly darkColorHandler: DarkColorHandler;

    /**
     * A handler to convert HTML string to a trust HTML string.
     * By default it will just return the original HTML string directly.
     * To override, pass your own trusted HTML handler to EditorOptions.trustedHTMLHandler
     */
    readonly trustedHTMLHandler: TrustedHTMLHandler;

    /**
     * A helper class to provide DOM access APIs
     */
    readonly domHelper: DOMHelper;

    /**
     * A callback to be invoked when any exception is thrown during disposing editor
     * @param plugin The plugin that causes exception
     * @param error The error object we got
     */
    readonly disposeErrorHandler?: (plugin: EditorPlugin, error: Error) => void;
}

/**
 * Default DOM and Content Model conversion settings for an editor
 */
export interface ContentModelSettings<OptionType, ConfigType> {
    /**
     * Built in options used by editor
     */
    builtIn: OptionType;

    /**
     * Customize options passed in from Editor Options, used for overwrite default option.
     * This will also be used by copy/paste
     */
    customized: OptionType;

    /**
     * Configuration calculated from default and customized options.
     * This is a cached object so that we don't need to cache it every time when we use Content Model
     */
    calculated: ConfigType;
}
