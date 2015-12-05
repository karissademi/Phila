/*----------------------------------------------------------------------*/
/* Observable Extension for Editing
/*----------------------------------------------------------------------*/
ko.extenders.editable = function (target, option) {
	if (Array.isArray(target()))
		target.editValue = ko.observableArray(target().slice());
	else
		target.editValue = ko.observable(target());
};

ko.observable.fn.beginEdit = function (transaction) {

	var self = this;
	var commitSubscription,
        rollbackSubscription;

	self.dispose = function () {
		// kill this subscriptions
		commitSubscription.dispose();
		rollbackSubscription.dispose();
	};

	self.commit = function () {
		// update the actual value with the edit value
		self(self.editValue());

		// dispose the subscriptions
		self.dispose();
	};

	self.rollback = function () {
		// rollback the edit value
		self.editValue(self());

		// dispose the subscriptions
		self.dispose();
	};

	//  subscribe to the transaction commit and reject calls
	commitSubscription = transaction.subscribe(self.commit,
        self,
        "commit");

	rollbackSubscription = transaction.subscribe(self.rollback,
        self,
        "rollback");

	return self;
};