var chai = require('chai').use(require('sinon-chai')),
    expect = chai.expect,
    sinon = require('sinon'),
    mongoose = require('mongoose'),
    eventful = require('./../'),
    _ = require('lodash')

describe('Model with mongoose-eventful plugin', function() {
  // TODO: get rid of this duplication, with mocha-mongoose?
  before(function(done) {
    mongoose.connect('mongodb://localhost/mongoose-eventful-test', function(err) {
      if (err) {
        console.error('MongoDB: ' + err.message)
        console.error('MongoDB is running? Is it accessible by this application?')
        return done(err)
      }
      // TODO: dropDatabase is quicker than dropping all the collections?
      mongoose.connection.db.dropDatabase(done)
    })
  })

  // TODO: get rid of this duplication, with mocha-mongoose?
  after(function(done) {
    mongoose.connection.close(done)
  })

  before(function() {
    this.EventfulSchema = new mongoose.Schema({}).plugin(eventful)
    this.EventfulModel = mongoose.model('EventfulModel', this.EventfulSchema)
  })

  it('emits created when document is created', function(done) {
    var callOnCreated = sinon.spy()
    this.EventfulModel.on('created', callOnCreated)
    this.EventfulModel.create({}, function() {
      expect(callOnCreated).to.have.been.called
      done()
    })
  })

  it('emits removed when document is removed', function(done) {
    var callOnRemoved = sinon.spy()
    this.EventfulModel.on('removed', callOnRemoved)
    this.EventfulModel.create({}, function(err, doc) {
      doc.remove(function(err) {
        expect(callOnRemoved).to.have.been.called
        done()
      })
    })
  })

  it('doesn\'t emit changed when document is created', function(done) {
    var callOnChanged = sinon.spy()
    this.EventfulModel.on('changed', callOnChanged)
    this.EventfulModel.create({}, function() {
      expect(callOnChanged).to.not.have.been.called
      done()
    })
  })

  describe('with emitChangedOnCreated option is true', function() {
    before(function() {
      this.EventfulSchema = new mongoose.Schema({}).plugin(eventful, {emitChangedOnCreated: true})
      this.EventfulModel = mongoose.model('EventfulModelWithEmitChangeOnCreatedOption', this.EventfulSchema)
    })

    it('emits changed when document is created', function(done) {
      var callOnChanged = sinon.spy()
      this.EventfulModel.on('changed', callOnChanged)
      this.EventfulModel.create({}, function() {
        expect(callOnChanged).to.have.been.called
        done()
      })
    })
  })

  describe('with a simple field', function() {
    before(function() {
      this.EventfulSchema = new mongoose.Schema({aSimpleField: 'string'}).plugin(eventful)
      this.EventfulModel = mongoose.model('EventfulModelWithSimpleField', this.EventfulSchema)
    })

    it('emits changed event when the field is changed', function(done) {
      var self = this

      self.EventfulModel.create({aSimpleField: 'initial value'}, function(err, doc) {
        self.EventfulModel.on('changed', function(doc) {
          expect(doc.aSimpleField).to.eql('changed value')
          done()
        })
        doc.set('aSimpleField', 'changed value')
        doc.save()
      })
    })

    it('emits changed:<FieldName> when the field is changed', function(done) {
      var self = this

      self.EventfulModel.create({aSimpleField: 'initial value'}, function(err, doc) {
        self.EventfulModel.on('changed:aSimpleField', function(doc) {
          expect(doc.aSimpleField).to.eql('changed value')
          done()
        })
        doc.set('aSimpleField', 'changed value')
        doc.save()
      })
    })

    it('doesn\'t emit changed:<FieldName> when document is created', function(done) {
      var callOnChanged = sinon.spy()
      this.EventfulModel.on('changed:aSimpleField', callOnChanged)
      this.EventfulModel.create({aSimpleField: 'initial value'}, function() {
        expect(callOnChanged).to.not.have.been.called
        done()
      })
    })
  })

  afterEach(function() {
    this.EventfulModel.removeAllListeners('changed')
    this.EventfulModel.removeAllListeners('changed:aSimpleField')
  })
})
