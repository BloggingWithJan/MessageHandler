sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sample/MessageHandler/control/MessageHandler/MessageHandler"
], function (Controller, JSONModel, MessageHandler) {
	"use strict";

	return Controller.extend("sample.MessageHandler.controller.View1", {
		onInit: function () {

			this.oViewModel = new JSONModel({
				bClear: false,
				bOpenWhenError: false
			});
			this.getView().setModel(this.oViewModel, "viewmodel");

			//everything relevant for the messagehandler
			this.oMessagePopoverButton = this.getView().byId("messagePopoverBtn");
			this.oMessageHandler = new MessageHandler(this, this.oMessagePopoverButton, this.onActiveTitlePress.bind(this));
			this.getView().setModel(this.oMessageHandler.oMessageModel, "messagePopover");

		},
		/**
		 * @description activeTitlePress method for the {@link MessageHandler}
		 * @param {Object} oMessage - message object
		 */
		onActiveTitlePress: function (oMessage) {
			alert("onActiveTitlePress");
		},
		/**
		 * @description event for the messagepopover button
		 * opens the message popover of the messagehandler
		 */
		onMessagePopoverPress: function () {
			this.oMessageHandler.oMessagePopover.toggle(this.oMessagePopoverButton);
		},
		/**
		 * @description generate lorem ipsum messages
		 * @param {sap.ui.base.Event} oEvt - event of sap.m.Button press
		 * @param {string} sMessageType - sap.ui.core.MessageType
		 */
		generateMessage: function (oEvt, sMessageType) {
			var aMessages = [{
				type: sMessageType,
				title: "Lorem ipsum",
				activeTitle: true,
				subtitle: "Lorem ipsum",
				description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr"
			}];
			this.oMessageHandler.addMessages(aMessages, this.oViewModel.getProperty("/bClear"), this.oViewModel.getProperty("/bOpenWhenError"));
		}
	});
});