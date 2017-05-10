import ChatClient from "./ChatClient"
import MinHeap from "./MinHeap"
import WordCount from "./WordCount"

function ChatBot(iMessageInterval, iTopWordCount) {
    this.iMessageInterval = iMessageInterval;
    this.iTopWordCount = iTopWordCount;

    this.oWordCounts = {};
    this.oMinHeap = new MinHeap(function(oWordCount) {
        return oWordCount.iCount;
    });
    this.iMessageTimer = setInterval(this.messageRoom, this.iMessageInterval);

    // Attach listener
    ChatClient.onReceiveMessage(this.processMessage);
}

ChatBot.prototype.messageRoom = function() {
    // Alert the room
    ChatClient.sendMessage(this._formMessage());

    // Clear our word count
    this.oWordCounts = {};
};

// Assuming the usernames can not contain the character ':'
ChatBot.prototype.processMessage = function(strUserAndMessage) {
    const strMessage = strUserAndMessage.split(":")[1];

    // Break the message into only words using regex. The \b is the word boundary
    // metacharacter, no need to reinvent the wheel for this.
    let aResults = strMessage.match(/\b(\w+)\b/g);
    for (let i = 0; i < aResults.length; i++) {
        this._addWord(aResults[i]);
    }
};

ChatBot.prototype.shutDown = function() {
    clearInterval(this.iMessageTimer);
};

ChatBot.prototype._addWord = function(strWord) {
    if (this.oWordCounts[strWord]) {
        // Already exists. Updating here will update the reference in the MinHeap as well
        // TODO: What if root of min heap is not min after this operation
        this.oWordCounts[strWord].iCount++;
    } else {
        let oWordCount = new WordCount(strWord);
        this.oWordCounts[strWord] = oWordCount;

        if (this.oMinHeap.size() < this.iTopWordCount) {
            // Add until we have a full min heap count
            this.oMinHeap.push(oWordCount);
        } else {
            // Check if the count is less than the current minimum of the top 10 values
            if (this.oMinHeap.peek().iCount < oWordCount.iCount) {
                // Insert
                this.oMinHeap.pop();
                this.oMinHeap.push(oWordCount);
            }
        }
    }
};

ChatBot.prototype._formMessage = function() {
    let strMessage = "";

    for (let i = 0; i < this.iTopWordCount; i++) {
        if (this.oMinHeap.size() > 0) {
            let oWordCount = this.oMinHeap.pop();
            strMessage += oWordCount.strWord + ": " + oWordCount.iCount + "\n";
        }
    }

    return strMessage;
};

export default ChatBot;