var _ = require('lodash')

module.exports = function(schema, options) {
  options = _.extend({emitChangedOnCreated: false}, options || {})

  schema.pre('save', function(next) {
    // the current model is already an event emitter
    var fieldsThatHaveChanged = this.modifiedPaths(),
        model = this.model(this.constructor.modelName),
        alreadyEmitted = {}

    var shouldEmitChangedWhenCreated = (!this.isNew || (this.isNew && options.emitChangedOnCreated))

    if (fieldsThatHaveChanged && shouldEmitChangedWhenCreated) {
      model.emit('changed', this)

      for (var index in fieldsThatHaveChanged) {
        var eventKey = 'changed:' + fieldsThatHaveChanged[index]
        if (!alreadyEmitted[eventKey]) {
          model.emit(eventKey, this)
          alreadyEmitted[eventKey] = true
        }
      }
    }

    if (this.isNew) {
      model.emit('created', this)
    }

    next()
  })

  schema.post('remove', function() {
    this.model(this.constructor.modelName).emit('removed', this)
  });
}
