"use strict";
import {ORM} from '../../../src/orm.js';

describe('ORM', function () {
  describe('Model', function () {

    it('should be defined', function () {
      expect(ORM.Model).toBeDefined();
    });

    describe('define', function () {
      it('should return a model that extends the base model', function() {
        var Person = ORM.Model.define('Person', {});
        expect(Person instanceof BaseModel).toBeTruthy();
      });
    });

  });

});
