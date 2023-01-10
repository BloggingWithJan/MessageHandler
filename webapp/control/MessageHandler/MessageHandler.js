sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/ui/core/MessageType",
	"sap/m/ButtonType"
], function (BaseObject, JSONModel, MessageItem, MessagePopover, MessageType, ButtonType) {
	"use strict";
	return BaseObject.extend("sample.MessageHandler.control.MessageHandler.MessageHandler", {

		/**
		 * @class MessageHandler
		 * @classdesc 
		 * The messagehandler is a custom control that contains logic and methods to easily get a <code>sap.m.MessagePopover</code> running.
		 * <h4> How to use it </h4>
		 * Check out the following documentation {@link https://bloggingwithjan.com/setup-an-sap-m-messagepopover-quickly-and-easily|BloggingWithJan}
		 * 
		 * @param {sap.ui.core.mvc.Controller} oController - Controller of the view
		 * @param {sap.m.Button} oButton - Button that is used to open and close the <code>sap.m.MessagePopover</code>
		 * @param {function} fnOnActiveTitlePress - Function that is used for the <code>activeTitlePress</code> event
		 */
		constructor: function (oController, oButton, fnOnActiveTitlePress) {
			BaseObject.apply(this);
			this._oParentController = oController;
			this._oButton = oButton;
			this._fnOnActiveTitlePress = fnOnActiveTitlePress;

			var oMessageTemplate = new MessageItem({
				type: "{messagePopover>type}",
				title: "{messagePopover>title}",
				activeTitle: "{messagePopover>activeTitle}",
				description: "{messagePopover>description}",
				subtitle: "{messagePopover>subtitle}"
			});

			this.oMessagePopover = new MessagePopover({
				items: {
					model: 'messagePopover',
					path: '/messages',
					template: oMessageTemplate
				},
				activeTitlePress: function (oEvt) {
					var oMessage = oEvt.getParameter("item").getBindingContext("messagePopover").getObject();
					this._fnOnActiveTitlePress(oMessage);
				}.bind(this)
			});

			this.oMessageModel = new JSONModel({
				icon: "sap-icon://information",
				type: ButtonType.Neutral,
				text: 0,
				messages: []
			});
			this._oButton.addDependent(this.oMessagePopover);

		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description Function to add messages to the MessageHandler
		 * @param {array} aMessages - Messages
		 * @param {string} aMessages[i].type - Type of message
		 * @param {string} aMessages[i].title - Title of message
		 * @param {string} aMessages[i].activeTitle - activeTitle Y/N
		 * @param {string} aMessages[i].subtitle - Subtitle of message
		 * @param {string} aMessages[i].description - Description of message
		 * @param {boolean} bClear - clear all existing messages Y/N
		 * @param {boolean} bOpenWhenError - open messagepopover when errors exist
		 */
		addMessages: function (aMessages, bClear, bOpenWhenError) {
			var iErrorCount = 0;
			var aTempMessages = bClear ? [] : this.oMessageModel.getProperty("/messages");

			for (var oMessage of aMessages) {
				iErrorCount = oMessage.type === MessageType.Error ? iErrorCount + 1 : iErrorCount;
				aTempMessages.splice(0, 0, oMessage);
			}

			this.oMessageModel.setProperty("/messages", aTempMessages);
			this.oMessageModel.setProperty("/icon", this.determineIcon());
			this.oMessageModel.setProperty("/type", this.determineButtonType());
			this.oMessageModel.setProperty("/text", this.determineSeverityMessages());

			if (iErrorCount > 0 && bOpenWhenError) {
				this.oMessagePopover.toggle(this._oButton);
			}

		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description determine the button icon according to the message with the highest serverity
		 */
		determineIcon: function () {

			var sIcon;
			var aMessages = this.oMessageModel.getProperty("/messages");

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
				case MessageType.Error:
					sIcon = "sap-icon://error";
					break;
				case MessageType.Warning:
					sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
					break;
				case MessageType.Success:
					sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
					break;
				default:
					sIcon = !sIcon ? "sap-icon://information" : sIcon;
					break;
				}
			});

			return sIcon;
		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description Display the button type according to the message with the highest severity
		 * The priority of the message types are as follows: Error > Warning > Success > Info
		 */
		determineButtonType: function () {

			var sHighestSeverityIcon = ButtonType.Success;
			var aMessages = this.oMessageModel.getProperty("/messages");

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
				case MessageType.Error:
					sHighestSeverityIcon = ButtonType.Negative;
					break;
				case MessageType.Warning:
					sHighestSeverityIcon = sHighestSeverityIcon !== ButtonType.Negative ? ButtonType.Critical : sHighestSeverityIcon;
					break;
				case MessageType.Success:
					sHighestSeverityIcon = sHighestSeverityIcon !== ButtonType.Negative && sHighestSeverityIcon !== ButtonType.Critical ?
						ButtonType.Success :
						sHighestSeverityIcon;
					break;
				default:
					sHighestSeverityIcon = !sHighestSeverityIcon ? ButtonType.Neutral : sHighestSeverityIcon;
					break;
				}
			});

			return sHighestSeverityIcon;
		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description Display the number of messages with the highest severity
		 */
		determineSeverityMessages: function () {

			var sHighestSeverityIconType = this.determineButtonType();
			var sHighestSeverityMessageType;

			switch (sHighestSeverityIconType) {
			case ButtonType.Negative:
				sHighestSeverityMessageType = MessageType.Error;
				break;
			case ButtonType.Critical:
				sHighestSeverityMessageType = MessageType.Warning;
				break;
			case ButtonType.Success:
				sHighestSeverityMessageType = MessageType.Success;
				break;
			default:
				sHighestSeverityMessageType = !sHighestSeverityMessageType ? MessageType.Information : sHighestSeverityMessageType;
				break;
			}

			return this.oMessageModel.getProperty("/messages").reduce(function (iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0);
		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description clear all messages 
		 */
		clearMessagePopover: function () {
			this.addMessages([], true, false);
		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description Exception to Message - <b>WORK IN PROGRESS - this method is not finished yet</b>
		 * @param {object} oException - An Exception
		 * @returns {Array} Array of messages
		 */
		convertExceptionToMessages: function (oException) {
			var aMessages = [];

			if (oException.responseText) {
				try {
					var oResponseText = JSON.parse(oException.responseText);
					var aErrorMessages = oResponseText.error.innererror.errordetails;
					if (!aErrorMessages) {
						var aErrorMessages = [{
							severity: "Error",
							message: oException.message,
							description: oResponseText.error.message.value,
							code: oException.statusCode,
							exception: oException
						}];
					}
				} catch {
					var aErrorMessages = [{
						severity: "Error",
						message: oException.message,
						description: oException.responseText,
						code: oException.statusCode
					}];
				}

				for (var oMessage of aErrorMessages) {
					aMessages.push({
						type: oMessage.severity === 'error' ? 'Error' : oMessage.severity,
						title: oMessage.message,
						subtitle: oMessage.code,
						description: oMessage.description
					});
				}
			}

			return aMessages;
		},
		/**
		 * @memberOf MessageHandler
		 * @public
		 * @description Convert an XML Error Response to an Message for the MessagePopover - <b>WORK IN PROGRESS - this method is not finished yet</b>
		 * @param {string} sXMLResponse - XMLResponse
		 * @param {object} oArguments - Arguments
		 * @param {string} oArguments.messageTitle - If you want to declare your own title of the message
		 * @returns {Array} Array of messages
		 */
		convertXMLResponseToMessages: function (sXMLResponse, oArguments) {
			var aMessages = [];

			try {
				var oXMLMessage = jQuery.parseXML(sXMLResponse);
				var sMessageTitle = oXMLMessage.querySelector("message").textContent;
				var aXMLErrorDetails = oXMLMessage.getElementsByTagName("errordetail");

				for (var oXMLErrorDetail of aXMLErrorDetails) {
					//read xmltags
					var sErrorType = oXMLErrorDetail.childNodes[4].textContent === 'error' ? MessageType.Error : oXMLErrorDetail.childNodes[4].textContent;
					var sErrorCode = oXMLErrorDetail.childNodes[1].textContent;
					var sMessage = oXMLErrorDetail.childNodes[2].textContent;
					var sTarget = oXMLErrorDetail.childNodes[5].textContent;

					aMessages.push({
						type: sErrorType,
						title: oArguments.messageTitle ? oArguments.messageTitle : sMessageTitle,
						subtitle: sErrorCode,
						description: sMessage
					});
				}

			} catch {

				aMessages.push({
					type: MessageType.Error,
					title: oArguments.messageTitle ? oArguments.messageTitle : "ERROR",
					description: sXMLResponse
				});
			}

			return aMessages;

		}
	});
});