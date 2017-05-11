function MinHeap(fnScorer) {
    this.aValues = [];
    this.fnScorer = fnScorer;
}

MinHeap.prototype.size = function() {
    return this.aValues.length;
};

MinHeap.prototype.push = function(elem) {
    // Add and bubble the element to its proper place
    this.aValues.push(elem);
    this._bubbleUp(this.aValues.length - 1);
};

MinHeap.prototype.pop = function() {
    const resElem = this.aValues[0];
    const endElem = this.aValues.pop();

    // If there are elements remaining, place the end at the start and sink down to place
    if (this.aValues.length) {
        this.aValues[0] = endElem;
        this._sinkDown(0);
    }

    return resElem;
};

MinHeap.prototype.peek = function() {
    return this.aValues[0];
};

MinHeap.prototype.remove = function(elem) {
    let endElem;
    let iLength = this.aValues.length;

    for (let i = 0; i < this.aValues.length; i++) {
        if (this.aValues[i] !== elem) {
            continue;
        }

        endElem = this.aValues.pop();

        // If the last element was the one to be removed, we don't need to continue
        if (i === iLength - 1) {
            break;
        }

        this.aValues[i] = endElem;
        this._bubbleUp(i);
        this._sinkDown(i);
        break;
    }
};

MinHeap.prototype._bubbleUp = function(i) {
    const elem = this.aValues[i];
    let iParentIndx, parentElem;

    while (i > 0) {
        iParentIndx = this._getParentIndx(i);
        parentElem = this.aValues[iParentIndx];

        // If the parent is less, we are done here
        if (this.fnScorer(parentElem) < this.fnScorer(elem)) {
            break;
        }

        // Swap the elements
        this.aValues[iParentIndx] = elem;
        this.aValues[i] = parentElem;
        i = iParentIndx;
    }
};

MinHeap.prototype._sinkDown = function(i) {
    const elem = this.aValues[i];
    let iSwap = null;
    let aChildren, firstChildElem, iFirstChildIndx, iSecondChildIndx, secondChildElem, compareElem;

    while (true) {
        aChildren = this._getChildIndices(i);
        iFirstChildIndx = aChildren[0];
        iSecondChildIndx = aChildren[1];

        // If the first child exists, score it and see if we need to swap
        if (iFirstChildIndx < this.aValues.length) {
            firstChildElem = this.aValues[iFirstChildIndx];

            if (this.fnScorer(firstChildElem) < this.fnScorer(elem)) {
                // If child is less, swap!
                iSwap = iFirstChildIndx;
            }
        }

        // Repeat for second child
        if (iSecondChildIndx < this.aValues.length) {
            secondChildElem = this.aValues[iSecondChildIndx];

            // Compare to first child or to the current value?
            if (iSwap === null) {
                compareElem = elem;
            } else {
                compareElem = firstChildElem;
            }

            if (this.fnScorer(secondChildElem) < this.fnScorer(compareElem)) {
                iSwap = iSecondChildIndx;
            }
        }

        if (iSwap === null) {
            break;
        }

        // Do the swap
        this.aValues[i] = this.aValues[iSwap];
        this.aValues[iSwap] = elem;
        i = iSwap;
    }
};

MinHeap.prototype._getParentIndx = function(i) {
    return Math.floor((i + 1) / 2) - 1;
};

MinHeap.prototype._getChildIndices = function(i) {
    const iSecond = (i + 1) * 2;
    const iFirst = iSecond - 1;
    return [iFirst, iSecond];
};

export default MinHeap;