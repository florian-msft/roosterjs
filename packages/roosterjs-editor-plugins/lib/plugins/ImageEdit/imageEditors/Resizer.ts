import DragAndDropContext, { X, Y } from '../types/DragAndDropContext';
import DragAndDropHandler from '../../../pluginUtils/DragAndDropHandler';
import ImageEditInfo, { ResizeInfo } from '../types/ImageEditInfo';
import ImageHtmlOptions from '../types/ImageHtmlOptions';
import { CreateElementData } from 'roosterjs-editor-types';
import { ImageEditElementClass } from '../types/ImageEditElementClass';

const RESIZE_HANDLE_SIZE = 10;
const RESIZE_SIDE_HANDLE_WIDTH = 6;
const RESIZE_SIDE_HANDLE_HEIGHT = 16;
const RESIZE_HANDLE_MARGIN = 3;
const Xs: X[] = ['w', '', 'e'];
const Ys: Y[] = ['s', '', 'n'];

/**
 * @internal
 * The resize drag and drop handler
 */
export const Resizer: DragAndDropHandler<DragAndDropContext, ResizeInfo> = {
    onDragStart: ({ editInfo }) => ({ ...editInfo }),
    onDragging: ({ x, y, editInfo, options }, e, base, deltaX, deltaY) => {
        const ratio =
            base.widthPx > 0 && base.heightPx > 0 ? (base.widthPx * 1.0) / base.heightPx : 0;

        [deltaX, deltaY] = rotateCoordinate(deltaX, deltaY, editInfo.angleRad);

        const horizontalOnly = x == '';
        const verticalOnly = y == '';
        const shouldPreserveRatio =
            !(horizontalOnly || verticalOnly) && (options.preserveRatio || e.shiftKey);
        let newWidth = horizontalOnly
            ? base.widthPx
            : Math.max(base.widthPx + deltaX * (x == 'w' ? -1 : 1), options.minWidth);
        let newHeight = verticalOnly
            ? base.heightPx
            : Math.max(base.heightPx + deltaY * (y == 'n' ? -1 : 1), options.minHeight);

        if (shouldPreserveRatio && ratio > 0) {
            newHeight = Math.min(newHeight, newWidth / ratio);
            newWidth = Math.min(newWidth, newHeight * ratio);

            if (newWidth < newHeight * ratio) {
                newWidth = newHeight * ratio;
            } else {
                newHeight = newWidth / ratio;
            }
        }

        editInfo.widthPx = newWidth;
        editInfo.heightPx = newHeight;

        return true;
    },
};

/**
 * @internal Calculate the rotated x and y distance for mouse moving
 * @param x Original x distance
 * @param y Original y distance
 * @param angle Rotated angle, in radian
 * @returns rotated x and y distances
 */
export function rotateCoordinate(x: number, y: number, angle: number): [number, number] {
    if (x == 0 && y == 0) {
        return [0, 0];
    }
    const hypotenuse = Math.sqrt(x * x + y * y);
    angle = Math.atan2(y, x) - angle;
    return [hypotenuse * Math.cos(angle), hypotenuse * Math.sin(angle)];
}

/**
 * @internal
 * Double check if the changed size can satisfy current width of container.
 * When resize an image and preserve ratio, its size can be limited by the size of container.
 * So we need to check the actual size and calculate the size again
 * @param editInfo Edit info of the image
 * @param preserveRatio Whether w/h ratio need to be preserved
 * @param actualWidth Actual width of the image after resize
 * @param actualHeight Actual height of the image after resize
 */
export function doubleCheckResize(
    editInfo: ImageEditInfo,
    preserveRatio: boolean,
    actualWidth: number,
    actualHeight: number
) {
    let { widthPx, heightPx } = editInfo;
    const ratio = heightPx > 0 ? widthPx / heightPx : 0;

    actualWidth = Math.floor(actualWidth);
    actualHeight = Math.floor(actualHeight);
    widthPx = Math.floor(widthPx);
    heightPx = Math.floor(heightPx);

    editInfo.widthPx = actualWidth;
    editInfo.heightPx = actualHeight;

    if (preserveRatio && ratio > 0 && (widthPx !== actualWidth || heightPx !== actualHeight)) {
        if (actualWidth < widthPx) {
            editInfo.heightPx = actualWidth / ratio;
        } else {
            editInfo.widthPx = actualHeight * ratio;
        }
    }
}

/**
 * @internal
 * Get HTML for resize handles at the corners
 */
export function getCornerResizeHTML({
    editInfo: editInfo,
    borderColor: resizeBorderColor,

    circularHandlers: circularHandlers,
}: ImageHtmlOptions): CreateElementData[] {
    const result: CreateElementData[] = [];

    Xs.forEach(x =>
        Ys.forEach(y =>
            result.push(
                (x == '') == (y == '')
                    ? getResizeHandleHTML(x, y, resizeBorderColor, circularHandlers)
                    : null
            )
        )
    );
    return result;
}

function imageArea(width: number, height: number): number {
    return width * height;
}

/**
 * @internal
 * Get HTML for resize handles on the sides
 */
export function getSideResizeHTML({
    editInfo: editInfo,
    borderColor: resizeBorderColor,
    sizeAdaptiveHandlers: sizeAdaptiveHandlers,
    circularHandlers: circularHandlers,
}: ImageHtmlOptions): CreateElementData[] {
    const { widthPx, heightPx } = editInfo;
    if (sizeAdaptiveHandlers && widthPx && heightPx && imageArea(widthPx, heightPx) < 10000) {
        return;
    }
    const result: CreateElementData[] = [];
    Xs.forEach(x =>
        Ys.forEach(y =>
            result.push(
                (x == '') != (y == '')
                    ? getResizeHandleHTML(
                          x,
                          y,
                          resizeBorderColor,
                          circularHandlers,
                          true /** isSideHandlers */
                      )
                    : null
            )
        )
    );
    return result;
}

function getResizeHandleHTML(
    x: X,
    y: Y,
    borderColor: string,
    circularHandlers?: boolean,
    isSideHandlers?: boolean
): CreateElementData {
    const leftOrRight = x == 'w' ? 'left' : 'right';
    const topOrBottom = y == 'n' ? 'top' : 'bottom';
    const leftOrRightValue = x == '' ? '50%' : '0px';
    const topOrBottomValue = y == '' ? '50%' : '0px';
    const direction = y + x;
    return x == '' && y == ''
        ? {
              tag: 'div',
              style: `position:absolute;left:0;right:0;top:0;bottom:0;border:solid 2px ${borderColor};pointer-events:none;`,
          }
        : {
              tag: 'div',
              style: `position:absolute;${leftOrRight}:${leftOrRightValue};${topOrBottom}:${topOrBottomValue}`,
              children: [
                  {
                      tag: 'div',
                      style: setHandlerStyle(
                          circularHandlers,
                          isSideHandlers,
                          y,
                          borderColor,
                          direction,
                          topOrBottom,
                          leftOrRight
                      ),
                      className: ImageEditElementClass.ResizeHandle,
                      dataset: { x, y },
                  },
              ],
          };
}

function setHandlerStyle(
    circularHandlers: boolean,
    isSideHandlers: boolean,
    y: string,
    borderColor: string,
    direction: string,
    topOrBottom: string,
    leftOrRight: string
) {
    if (!circularHandlers) {
        return `position:relative;width:${RESIZE_HANDLE_SIZE}px;height:${RESIZE_HANDLE_SIZE}px;background-color: ${borderColor};cursor:${direction}-resize;${topOrBottom}:-${RESIZE_HANDLE_MARGIN}px;${leftOrRight}:-${RESIZE_HANDLE_MARGIN}px;`;
    } else if (!isSideHandlers) {
        return `position:relative;width:${RESIZE_HANDLE_SIZE}px;height:${RESIZE_HANDLE_SIZE}px;background-color: #FFFFFF;cursor:${direction}-resize;${topOrBottom}:-${RESIZE_HANDLE_MARGIN}px;${leftOrRight}:-${RESIZE_HANDLE_MARGIN}px;border-radius:100%;z-index:1;border: 2px solid #EAEAEA;box-shadow: 0px 0.36316px 1.36185px rgba(100, 100, 100, 0.25);`;
    } else if (!y) {
        return `position:relative;width:${RESIZE_SIDE_HANDLE_WIDTH}px;height:${RESIZE_SIDE_HANDLE_HEIGHT}px;background-color: #FFFFFF;cursor:${direction}-resize;${topOrBottom}:-${RESIZE_HANDLE_MARGIN}px;${leftOrRight}:-${RESIZE_HANDLE_MARGIN}px;border-radius:20%;z-index:1;border: 1px solid #EAEAEA;box-shadow: 0px 0.36316px 1.36185px rgba(100, 100, 100, 0.25);`;
    } else {
        return `position:relative;width:${RESIZE_SIDE_HANDLE_HEIGHT}px;height:${RESIZE_SIDE_HANDLE_WIDTH}px;background-color: #FFFFFF;cursor:${direction}-resize;${topOrBottom}:-${RESIZE_HANDLE_MARGIN}px;${leftOrRight}:-${RESIZE_HANDLE_MARGIN}px;border-radius:20%;z-index:1;border: 1px solid #EAEAEA;box-shadow: 0px 0.36316px 1.36185px rgba(100, 100, 100, 0.25);`;
    }
}
