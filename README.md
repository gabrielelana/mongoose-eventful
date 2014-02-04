# What
Mongoose plugin to emit events when documents are created, updated and when fields are changed

# Usage
Right now this is the best documentation I can provide
```
Model with mongoose-eventful plugin
  ✓ emits created when document is created 
  ✓ emits removed when document is removed 
  ✓ doesn't emit changed when document is created 
  when emitChangedOnCreated option is true
    ✓ emits changed when document is created 
  with a simple field
    ✓ emits changed event when the field is changed 
    ✓ emits changed:<FieldName> when the field is changed 
    ✓ doesn't emit changed:<FieldName> when document is created 
  with a virtual field
    when emitChangedOnVirtualFields option is a list of virtual field paths
      ✓ emits change:<VirtualFieldName> when the virtual field is changed 
      ✓ emits change:<VirtualFieldName> when dependent field is changed directly 
      ✓ doesn't emit change:<VirtualFieldName> if the virtual field is not changed 
```

# TODO
* emits changed for fields in nested documents
* emits changed for fields in arrays of nested documents
* emits changed for array fields
* emits changed on virtual fields
  * detects changes on non primitive values of virtual field
  * emitChangedOnVirtualFields set to true means "for all virtual fields"
  * emitChangedOnVirtualFields set to {virtualFieldPath: listOfFieldsItDependsOn}
