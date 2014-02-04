# What
Mongoose plugin to emit events when documents are created, updated and when fields are changed

# TODO
* emits changed for fields in nested documents
* emits changed for fields in arrays of nested documents
* emits changed for array fields
* emits changed on virtual fields
  * detects changes on non primitive values of virtual field
  * emitChangedOnVirtualFields set to true means "for all virtual fields"
  * emitChangedOnVirtualFields set to {virtualFieldPath: listOfFieldsItDependsOn}
