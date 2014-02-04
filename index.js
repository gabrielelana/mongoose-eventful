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
    var doc = this,
        fieldsThatHaveChanged = doc.modifiedPaths(),
        model = doc.model(doc.constructor.modelName),
        alreadyEmitted = {}

    var shouldEmitChangedWhenCreated = (!doc.isNew || (doc.isNew && options.emitChangedOnCreated))

    if (fieldsThatHaveChanged && shouldEmitChangedWhenCreated) {
      model.emit('changed', doc)

      fieldsThatHaveChanged.forEach(function(fieldThatHaveChanged) {
        var eventKey = 'changed:' + fieldThatHaveChanged
        if (!alreadyEmitted[eventKey]) {
          model.emit(eventKey, doc)
          alreadyEmitted[eventKey] = true
        }
      })

      checkIfVirtualFieldsAreChanged(doc, model)
    }

    rememberInitialValueOfVirtualFields(doc)

    if (doc.isNew) {
      model.emit('created', doc)
    }

    next()
  })

  schema.post('remove', function() {
    this.model(this.constructor.modelName).emit('removed', this)
  });

  function checkIfVirtualFieldsAreChanged(doc, model) {
    if (options.emitChangedOnVirtualFields) {
      doc.$__.virtualFieldsPreviousValue = doc.$__.virtualFieldsPreviousValue || {}

      options.emitChangedOnVirtualFields.forEach(function(virtualFieldPath) {
        var previousVirtualFieldValue = doc.$__.virtualFieldsPreviousValue[virtualFieldPath]

        if (!_.isEqual(previousVirtualFieldValue, doc.get(virtualFieldPath))) {
          model.emit('changed:' + virtualFieldPath, doc)
        }
      })
    }
  }

  function rememberInitialValueOfVirtualFields(doc) {
    if (doc.isNew && options.emitChangedOnVirtualFields) {
      doc.$__.virtualFieldsPreviousValue = doc.$__.virtualFieldsPreviousValue || {}

      options.emitChangedOnVirtualFields.forEach(function(virtualFieldPath) {
        doc.$__.virtualFieldsPreviousValue[virtualFieldPath] = doc.get(virtualFieldPath)
      })
    }
  }
}
