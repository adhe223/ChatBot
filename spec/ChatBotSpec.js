import ChatClient from "../src/ChatClient";
import ChatBot from "../src/ChatBot"

describe("ChatBot", function () {
    describe("constructor", function() {
        it("attaches its listener", function () {
            spyOn(ChatClient, "onReceiveMessage");

            new ChatBot(10000, 10);
            expect(ChatClient.onReceiveMessage).toHaveBeenCalledTimes(1);
        });

        it("calls setInterval", function () {
            spyOn(window, "setInterval");

            new ChatBot(10000, 10);
            expect(window.setInterval).toHaveBeenCalledTimes(1);
        });
    });

    describe("messageRoom", function() {
        it("calls ChatClient.sendMessage", function() {
            spyOn(ChatClient, "sendMessage");

            const oChatBot = new ChatBot(10000, 10);
            oChatBot.messageRoom();
            expect(ChatClient.sendMessage).toHaveBeenCalledTimes(1);
        });
    });

    describe("processMessage", function() {
        it("splits a user/message string and calls _addWord as many times as there are words", function() {
            spyOn(ChatBot.prototype, "_addWord");

            const str = "alex:I have,four words";
            const oChatBot = new ChatBot(10000, 10);
            oChatBot.processMessage(str);

            expect(ChatBot.prototype._addWord).toHaveBeenCalledTimes(4);
        });
    });

    describe("shutDown", function() {
        it("calls clearInterval", function() {
            spyOn(window, "clearInterval");

            const oChatBot = new ChatBot(10000, 10);
            oChatBot.shutDown();

            expect(window.clearInterval).toHaveBeenCalledTimes(1);
        });
    });

    describe("_addWord", function() {
        it("adds a word to the hashmap and the min heap", function() {
            const oChatBot = new ChatBot(10000, 10);
            oChatBot._addWord("pirate");

            expect(oChatBot.oMinHeap.size()).toEqual(1);
            expect(oChatBot.oWordCounts["pirate"].iCount).toEqual(1);
        });
    });

    describe("acceptance test", function() {
        const oChatBot = new ChatBot(10000, 3);

        it("returns the most said three words given 4 words added", function() {
            console.log('hi');
            oChatBot.processMessage("User:hello hello bye jim jim hello good good");
            expect(oChatBot._formMessage()).toEqual("good: 2 jim: 2 hello: 3");
        });
    });
});