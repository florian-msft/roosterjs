import * as createSnapshotSelection from '../../lib/utils/createSnapshotSelection';
import { addUndoSnapshot } from '../../lib/coreApi/addUndoSnapshot';
import { EditorCore, SnapshotsManager } from 'roosterjs-content-model-types';

describe('addUndoSnapshot', () => {
    let core: EditorCore;
    let contentDiv: HTMLDivElement;
    let addSnapshotSpy: jasmine.Spy;
    let getKnownColorsCopySpy: jasmine.Spy;
    let createSnapshotSelectionSpy: jasmine.Spy;
    let triggerEventSpy: jasmine.Spy;
    let snapshotsManager: SnapshotsManager;

    beforeEach(() => {
        addSnapshotSpy = jasmine.createSpy('addSnapshot');
        getKnownColorsCopySpy = jasmine.createSpy('getKnownColorsCopy');
        createSnapshotSelectionSpy = spyOn(createSnapshotSelection, 'createSnapshotSelection');
        triggerEventSpy = jasmine.createSpy('triggerEvent');
        contentDiv = { innerHTML: '', contains: () => false } as any;

        snapshotsManager = {
            addSnapshot: addSnapshotSpy,
        } as any;

        core = {
            physicalRoot: contentDiv,
            logicalRoot: contentDiv,
            darkColorHandler: {
                getKnownColorsCopy: getKnownColorsCopySpy,
            },
            lifecycle: {},
            undo: {
                snapshotsManager,
            },
            api: {
                triggerEvent: triggerEventSpy,
            },
        } as any;
    });

    it('Is in shadow edit', () => {
        core.lifecycle.shadowEditFragment = {} as any;

        const result = addUndoSnapshot(core, false);

        expect(createSnapshotSelectionSpy).not.toHaveBeenCalled();
        expect(addSnapshotSpy).not.toHaveBeenCalled();
        expect(triggerEventSpy).not.toHaveBeenCalled();
        expect(result).toEqual(null);
    });

    it('Has a selection', () => {
        const mockedColors = 'COLORS' as any;
        const mockedHTML = 'HTML' as any;
        const mockedSnapshotSelection = 'SNAPSHOTSELECTION' as any;

        contentDiv.innerHTML = mockedHTML;

        getKnownColorsCopySpy.and.returnValue(mockedColors);
        createSnapshotSelectionSpy.and.returnValue(mockedSnapshotSelection);

        const result = addUndoSnapshot(core, false);

        expect(core.undo).toEqual({
            snapshotsManager: snapshotsManager,
        } as any);
        expect(snapshotsManager.hasNewContent).toBeFalse();
        expect(createSnapshotSelectionSpy).toHaveBeenCalledWith(core);
        expect(addSnapshotSpy).toHaveBeenCalledWith(
            {
                html: mockedHTML,
                entityStates: undefined,
                isDarkMode: false,
                selection: mockedSnapshotSelection,
                logicalRootPath: [],
            },
            false
        );
        expect(triggerEventSpy).toHaveBeenCalledWith(
            core,
            {
                eventType: 'snapshotLogicalRoot',
                logicalRoot: contentDiv,
                entityStates: [],
            },
            false
        );
        expect(result).toEqual({
            html: mockedHTML,
            entityStates: undefined,
            isDarkMode: false,
            selection: mockedSnapshotSelection,
            logicalRootPath: [],
        });
    });

    it('Has a selection, canUndoByBackspace', () => {
        const mockedColors = 'COLORS' as any;
        const mockedHTML = 'HTML' as any;
        const mockedSnapshotSelection = 'SNAPSHOTSELECTION' as any;

        contentDiv.innerHTML = mockedHTML;

        getKnownColorsCopySpy.and.returnValue(mockedColors);
        createSnapshotSelectionSpy.and.returnValue(mockedSnapshotSelection);

        const result = addUndoSnapshot(core, true);

        expect(core.undo).toEqual({
            snapshotsManager: snapshotsManager,
        } as any);
        expect(snapshotsManager.hasNewContent).toBeFalse();
        expect(createSnapshotSelectionSpy).toHaveBeenCalledWith(core);
        expect(addSnapshotSpy).toHaveBeenCalledWith(
            {
                html: mockedHTML,
                entityStates: undefined,
                isDarkMode: false,
                selection: mockedSnapshotSelection,
                logicalRootPath: [],
            },
            true
        );
        expect(triggerEventSpy).toHaveBeenCalledWith(
            core,
            {
                eventType: 'snapshotLogicalRoot',
                logicalRoot: contentDiv,
                entityStates: [],
            },
            false
        );
        expect(result).toEqual({
            html: mockedHTML,
            entityStates: undefined,
            isDarkMode: false,
            selection: mockedSnapshotSelection,
            logicalRootPath: [],
        });
    });

    it('Has entityStates', () => {
        const mockedColors = 'COLORS' as any;
        const mockedHTML = 'HTML' as any;
        const mockedSnapshotSelection = 'SNAPSHOTSELECTION' as any;
        const mockedEntityStates = 'ENTITYSTATES' as any;

        contentDiv.innerHTML = mockedHTML;

        getKnownColorsCopySpy.and.returnValue(mockedColors);
        createSnapshotSelectionSpy.and.returnValue(mockedSnapshotSelection);

        const result = addUndoSnapshot(core, false, mockedEntityStates);

        expect(core.undo).toEqual({
            snapshotsManager: snapshotsManager,
        } as any);
        expect(snapshotsManager.hasNewContent).toBeFalse();
        expect(createSnapshotSelectionSpy).toHaveBeenCalledWith(core);
        expect(addSnapshotSpy).toHaveBeenCalledWith(
            {
                html: mockedHTML,
                entityStates: mockedEntityStates,
                isDarkMode: false,
                selection: mockedSnapshotSelection,
                logicalRootPath: [],
            },
            false
        );
        expect(result).toEqual({
            html: mockedHTML,
            entityStates: mockedEntityStates,
            isDarkMode: false,
            selection: mockedSnapshotSelection,
            logicalRootPath: [],
        });
    });

    it('Verify get html after create selection', () => {
        const mockedColors = 'COLORS' as any;
        const mockedHTML1 = 'HTML1' as any;
        const mockedHTML2 = 'HTML2' as any;
        const mockedSnapshotSelection = 'SNAPSHOTSELECTION' as any;

        contentDiv.innerHTML = mockedHTML1;

        getKnownColorsCopySpy.and.returnValue(mockedColors);
        createSnapshotSelectionSpy.and.callFake(() => {
            contentDiv.innerHTML = mockedHTML2;
            return mockedSnapshotSelection;
        });

        const result = addUndoSnapshot(core, false);

        expect(core.undo).toEqual({
            snapshotsManager: snapshotsManager,
        } as any);
        expect(snapshotsManager.hasNewContent).toBeFalse();
        expect(createSnapshotSelectionSpy).toHaveBeenCalledWith(core);
        expect(addSnapshotSpy).toHaveBeenCalledWith(
            {
                html: mockedHTML2,
                entityStates: undefined,
                isDarkMode: false,
                selection: mockedSnapshotSelection,
                logicalRootPath: [],
            },
            false
        );
        expect(triggerEventSpy).toHaveBeenCalledWith(
            core,
            {
                eventType: 'snapshotLogicalRoot',
                logicalRoot: contentDiv,
                entityStates: [],
            },
            false
        );
        expect(result).toEqual({
            html: mockedHTML2,
            entityStates: undefined,
            isDarkMode: false,
            selection: mockedSnapshotSelection,
            logicalRootPath: [],
        });
    });
});
