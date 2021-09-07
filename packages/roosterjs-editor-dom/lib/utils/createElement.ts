import safeInstanceOf from './safeInstanceOf';
import { Browser } from './Browser';
import { CreateElementData, KnownCreateElementDataIndex } from 'roosterjs-editor-types';

export const KnownCreateElementData: Record<KnownCreateElementDataIndex, CreateElementData> = {
    [KnownCreateElementDataIndex.None]: null,

    // Edge can sometimes lose current format when Enter to new line.
    // So here we add an extra SPAN for Edge to workaround this bug
    [KnownCreateElementDataIndex.EmptyLine]: Browser.isEdge
        ? { tag: 'div', children: [{ tag: 'span', children: [{ tag: 'br' }] }] }
        : { tag: 'div', children: [{ tag: 'br' }] },
    [KnownCreateElementDataIndex.BlockquoteWrapper]: {
        tag: 'blockquote',
        style: 'margin-top:0;margin-bottom:0',
    },
    [KnownCreateElementDataIndex.CopyPasteTempDiv]: {
        tag: 'div',
        style:
            'width: 1px; height: 1px; overflow: hidden; position: fixed; top: 0; left; 0; -webkit-user-select: text',
        attributes: {
            contenteditable: 'true',
        },
    },
    [KnownCreateElementDataIndex.BlockListItem]: { tag: 'li', style: 'display:block' },
    [KnownCreateElementDataIndex.ContextMenuWrapper]: {
        tag: 'div',
        style: 'position: fixed; width: 0; height: 0',
    },
    [KnownCreateElementDataIndex.ImageEditWrapper]: {
        tag: 'div',
        style: 'width:100%;height:100%;position:relative;overflow:hidden',
    },
    [KnownCreateElementDataIndex.TableHorizontalResizer]: {
        tag: 'div',
        style: 'position: fixed; cursor: row-resize; user-select: none',
    },
    [KnownCreateElementDataIndex.TableVerticalResizer]: {
        tag: 'div',
        style: 'position: fixed; cursor: col-resize; user-select: none',
    },
    [KnownCreateElementDataIndex.TableResizerLTR]: {
        tag: 'div',
        style: 'position: fixed; cursor: nw-resize; user-select: none; border: 1px solid #808080',
    },
    [KnownCreateElementDataIndex.TableResizerRTL]: {
        tag: 'div',
        style: 'position: fixed; cursor: ne-resize; user-select: none; border: 1px solid #808080',
    },
};

export default function createElement(
    elementData: CreateElementData | KnownCreateElementDataIndex,
    document: Document
): Element {
    if (typeof elementData == 'number') {
        elementData = KnownCreateElementData[elementData];
    }

    if (!elementData || !elementData.tag) {
        return null;
    }

    const { tag, namespace, className, style, dataset, attributes, children } = elementData;
    const result = namespace
        ? document.createElementNS(namespace, tag)
        : document.createElement(tag);

    if (style) {
        result.setAttribute('style', style);
    }

    if (className) {
        result.className = className;
    }

    if (dataset && safeInstanceOf(result, 'HTMLElement')) {
        Object.keys(dataset).forEach(datasetName => {
            result.dataset[datasetName] = dataset[datasetName];
        });
    }

    if (attributes) {
        Object.keys(attributes).forEach(attrName => {
            result.setAttribute(attrName, attributes[attrName]);
        });
    }

    if (children) {
        children.forEach(child => {
            if (typeof child === 'string') {
                result.appendChild(document.createTextNode(child));
            } else if (child) {
                result.appendChild(createElement(child, document));
            }
        });
    }

    return result;
}