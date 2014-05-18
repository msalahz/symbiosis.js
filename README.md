ng-orm
======

An framework agnostic and easily extendible object relational mapping framework for the client-side.
It handles validation, association (one-to-many, many-to-many) and more. See the examples.

Preliminary readme(!).

Usage example:
=====
```javascript
var Person = ORM.Define('Person', {
	fields: {
		//Behind the scenes these fields are mapped into property instances (read more further down)
		name: {
			type: 'String'
		},
		//Shorthand for type specification
		surname: 'String',
		age: 'Number',
		friends: {
			hasMany: 'Book',
			lazyload: true, //Load association by manually populating fields e.g. model.$.hydrate('friends', 'books');
			eagerload: true //Load on initialization
		}
	},
	methods: {
		resetPassword: function (model, adapter)
		{
			return adapter.resetPassword(model);
		}
	},
	computedValues: {
		fullName: function(model) {
			return model.name + ' ' + model.surname;
		}
	},
	adapter: {
		configuration: {
			url: 'users'
		},
		get: function(model, configuration, cacheProvider, driver, done) { 
		/*. Check if model exists in cache first, if so, return cached person
		..*/
		},
		find: function(model, configuration, cacheProvider, driver, done) { /*...*/ },
		save: function(model, configuration, cacheProvider, driver, done) {
			driver[model.id?'post':'put'](configuration.url, model.toJSON())
				.then(function(person){
					cacheProvider.update(model, person);
					done(null, person); //ORM will map the response to an instance of the model.
				});
		},
		remove: function (model, configuration, cacheProvider, driver, done) {

		},
		resetPassword: function(model, configuration, cacheProvider, driver, done)
		{
		},
		customMethod: function(model, configuration, cacheProvider, driver, done) {
		}
	},
	driver: {
		get: function() {
		
		}
	},
	cacheProvider: {
		//Basic CRUD methods, default cacheProvider stores data in memory
	},
	validation: {
		//Overrides default property validators
		name: ORM.Validation('String')
				.required()
				.minLength(10)
				.maxLenght(20)
	},
	serializationHandlers: {
		//Only properties with a serialization handler will be included in the serialized data
		//Overrides default handlers
		name: function(value) {
			return value.toLowercase();
		},
		//Collection serialization
		friends: function(value) {
			return value.map(function(person){
			 	return person.$getUniqueIdentifier(); //Maps all users into an array of ids
			})
		}
	},
	deserializationHandlers: {
		//If model is instantiated with data, these handlers handles hydrating the fields
		name: function (value) {
			return String(value);
		},
		//Create a factory that can do this mapping, and handle lazyloading and eager loading gracefully
		friends: function(value) {
			return value.map(function(personId){
				return ORM.Models.get('Person').get(personId);
			});
		}
	},
	onInitializing: function (model) {
		model.$.isReady = false;

		var unbinder = $rootScope.$watch(function() {
			model.$.digest();
		}, angular.noop);

		return unbinder; //Should return a function that unbinds and unregisters all eventlisteners
	},
	beforeSave: function () {

	},
  afterSave: function () {

  },
  beforeRemove: function () {

  },
	onInitialized: function (model) {
		model.$.isReady = true;
	},
	onDigest: [
		'validator': function (model) {
			model.$$setValidationErrors(model.validate());
		}
		//Array of functions run on every call to model.digest().
		//by default the models validators and other stuff is put here
	],
	destroy: function (deregister) {
		//Calls the function that was returned from onInitialize
		deregister();
	},
	toObject: function() {
		return person this.$.serialize(); //Runs all serializationHandlers
	},
	defaults: {
		name: '',
		age: 5
	}
});
```

```javascript
//Instance methods
var person = Person.create({ /*..optional data..*/ });
person.$.save();
person.$.remove();
person.$.getUniqueIdentifier(); //Returns models primary keys value or something that when calling Person.get(ID) will return the exact same instance
person.$.fullName; //Using ES5 getter to return a computed value
person.$.validate(); //Returns an array of all fields, their isValid, and an optional message
person.$.$raw; //The raw backing models for the model

//person.$.validation.fields['age']:
//{
//	errors: ['Field is required']
//}

person.$.digest() //Triggers all digest listeners

//Model methods
Person.create();
Person.get(ID);
Person.find({name: 'Something'});
Person.find(/*...*/).populate('friends', 'projects'); //Returns a person with its associated friends and projects populated
```

# Model
A model handles all domain logic for a entity and talks to an adapter to let it do the heavy lifting.

## Properties
A model consists of one or many properties. A property handles the mapping / hydration of a field.
```javascript
function Property() {
	return {
		serializationHandler: function () {

		},
		deserializationHandler: function () {

		},
		validationHandler: function () {

		},
		defaultValue: function() {
			return new Date();
		}
	}
}
```

## Associations
An association between the different models is handled by special "collection" properties

## Validation

# Adapter
An adapter handles all interaction with a driver. It is an abstraction from the actual communication with a resource. It handles caching.

# Driver
A driver handles all interaction with a resource (local storage, REST API etc.)
