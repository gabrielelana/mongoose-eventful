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

      checkIfVirtualFieldsAreChanged(this, model)
    }

    rememberInitialValueOfVirtualFields(this)

    if (this.isNew) {
      model.emit('created', this)
    }

    next()
  })

  schema.post('remove', function() {
    this.model(this.constructor.modelName).emit('removed', this)
  });

  function checkIfVirtualFieldsAreChanged(doc, model) {
    if (options.emitChangedOnVirtualFields) {
      doc.$__.virtualFieldsPreviousValue = doc.$__.virtualFieldsPreviousValue || {}

      for (var index in options.emitChangedOnVirtualFields) {
        var virtualFieldPath = options.emitChangedOnVirtualFields[index]
        var previousVirtualFieldValue = doc.$__.virtualFieldsPreviousValue[virtualFieldPath]

        if (!_.isEqual(previousVirtualFieldValue, doc.get(virtualFieldPath))) {
          model.emit('changed:' + virtualFieldPath, doc)
        }
      }
    }
  }

  function rememberInitialValueOfVirtualFields(doc) {
    if (doc.isNew && options.emitChangedOnVirtualFields) {
      doc.$__.virtualFieldsPreviousValue = doc.$__.virtualFieldsPreviousValue || {}

      for (var index in options.emitChangedOnVirtualFields) {
        var virtualFieldPath = options.emitChangedOnVirtualFields[index]
        doc.$__.virtualFieldsPreviousValue[virtualFieldPath] = doc.get(virtualFieldPath)
      }
    }
  }
}
