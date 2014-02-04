var _ = require('lodash')

module.exports = function(schema, options) {
  options = _.extend(
    { emitChangedOnCreated: false,
      emitChangedOnVirtualFields: false
    },
    options || {}
  )

  if (_.isString(options.emitChangedOnVirtualFields)) {
    options.emitChangedOnVirtualFields = [].concat(options.emitChangedOnVirtualFields)
  }

  if (options.emitChangedOnVirtualFields) {
    schema.pre('set', function(next, fieldPath, fieldValue) {
      this.$__.virtualFieldsPreviousValue = this.$__.virtualFieldsPreviousValue || {}
      for (var index in options.emitChangedOnVirtualFields) {
        var virtualFieldPath = options.emitChangedOnVirtualFields[index]
        this.$__.virtualFieldsPreviousValue[virtualFieldPath] = this.get(virtualFieldPath)
      }
      next()
      return this
    })
  }

  schema.pre('save', function(next) {
    // the current model is already an event emitter
    var fieldsThatHaveChanged = this.modifiedPaths(),
        model = this.model(this.constructor.modelName),
        alreadyEmitted = {},
        index, virtualFieldPath

    var shouldEmitChangedWhenCreated = (!this.isNew || (this.isNew && options.emitChangedOnCreated))

    if (fieldsThatHaveChanged && shouldEmitChangedWhenCreated) {
      model.emit('changed', this)

      for (index in fieldsThatHaveChanged) {
        var eventKey = 'changed:' + fieldsThatHaveChanged[index]
        if (!alreadyEmitted[eventKey]) {
          model.emit(eventKey, this)
          alreadyEmitted[eventKey] = true
        }
      }

      if (options.emitChangedOnVirtualFields) {
        this.$__.virtualFieldsPreviousValue = this.$__.virtualFieldsPreviousValue || {}

        for (index in options.emitChangedOnVirtualFields) {
          virtualFieldPath = options.emitChangedOnVirtualFields[index]
          var previousVirtualFieldValue = this.$__.virtualFieldsPreviousValue[virtualFieldPath]

          if (!_.isEqual(previousVirtualFieldValue, this.get(virtualFieldPath))) {
            model.emit('changed:' + virtualFieldPath, this)
          }
        }
      }
    }

    if (this.isNew && options.emitChangedOnVirtualFields) {
      this.$__.virtualFieldsPreviousValue = this.$__.virtualFieldsPreviousValue || {}

      for (index in options.emitChangedOnVirtualFields) {
        virtualFieldPath = options.emitChangedOnVirtualFields[index]
        this.$__.virtualFieldsPreviousValue[virtualFieldPath] = this.get(virtualFieldPath)
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
