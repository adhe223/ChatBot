import ChatClient from "./ChatClient"
import MinHeap from "./MinHeap"
import WordCount from "./WordCount"

/*
Decided to utilize a combo of a hashmap and a min-heap. The hashmap allows us to look up each
word in constant time and update its count. The min-heap allows us to quickly see what the minimum of our top counts is
(operations are O(log k), where k is the number of top words), and decide if we should pop and put in our new word.
This approach has the added benefit of spreading the compute time out, so the work is done by time we need to retrieve it.
If we decided to store all the words in a hash then utilize a sort at the end, we'd hit a O(n log n) operation at once
and that could lead to poor user experience.
 */

function ChatBot(iMessageInterval, iTopWordCount) {
    this.iMessageInterval = iMessageInterval;
    this.iTopWordCount = iTopWordCount;

    // Dictionary and Min-Heap we will use for our data structures
    this.oWordCounts = {};
    this.oMinHeap = new MinHeap(function(oWordCount) {
        return oWordCount.iCount;
    });

    // Hook up the timer
    this.iMessageTimer = setInterval(this.messageRoom, this.iMessageInterval);

    // Attach listener
    //ChatClient.onReceiveMessage(this.processMessage.bind(this));
}

ChatBot.prototype.messageRoom = function() {
    // Alert the room
    ChatClient.sendMessage(this._formMessage());

    // Clear our word count
    this.oWordCounts = {};
};

// Assumes the usernames can not contain the character ':'
ChatBot.prototype.processMessage = function(strUserAndMessage) {
    const strMessage = strUserAndMessage.split(":")[1];

    // Break the message into only words using regex. The \b is the word boundary
    // metacharacter, no need to reinvent the wheel for this.
    let aResults = strMessage.match(/\b(\w+)\b/g);
    for (let i = 0; i < aResults.length; i++) {
        // Add each word to our data structures
        this._addWord(aResults[i]);
    }
};

ChatBot.prototype.shutDown = function() {
    clearInterval(this.iMessageTimer);
};

// Handle the adding of words to our data structure. Using a mix of a Hashmap and Min Heap.
ChatBot.prototype._addWord = function(strWord) {
    let oWordCount;

    if (this.oWordCounts[strWord]) {
        oWordCount = this.oWordCounts[strWord];

        // Already exists. Updating here will update the reference in the MinHeap as well.
        oWordCount.iCount++;

        if (oWordCount.bInHeap) {
            // We will remove this node and re-add it so that it bubbles to the correct place with its new value
            this.oMinHeap.remove(oWordCount);
        }
    } else {
        oWordCount = new WordCount(strWord);
        this.oWordCounts[strWord] = oWordCount;
    }

    if (this.oMinHeap.size() < this.iTopWordCount) {
        // Add until we have a full min heap count
        oWordCount.bInHeap = true;
        this.oMinHeap.push(oWordCount);
    } else {
        // Check if the count is less than the current minimum of the top 10 values
        if (this.oMinHeap.peek().iCount < oWordCount.iCount) {
            // Remove min
            this.oMinHeap.pop().bInHeap = false;

            // Insert
            oWordCount.bInHeap = true;
            this.oMinHeap.push(oWordCount);
        }
    }
};

// Build the message to display
ChatBot.prototype._formMessage = function() {
    let strMessage = "";

    // Problem doesn't say to display the top 10 in any order, just to display them. Popping of our heap
    // will return them in ascending order.
    for (let i = 0; i < this.iTopWordCount; i++) {
        if (this.oMinHeap.size() > 0) {
            let oWordCount = this.oMinHeap.pop();
            strMessage += oWordCount.strWord + ": " + oWordCount.iCount;

            // Add or don't add a trailing space
            strMessage = this.oMinHeap.size() === 0 ? strMessage : strMessage + " ";
        }
    }

    return strMessage;
};

export default ChatBot;