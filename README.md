# What
Mongoose plugin to emit events when documents are created or removed and when fields are changed

[![Build Status](https://travis-ci.org/gabrielelana/mongoose-eventful.png?branch=master)](https://travis-ci.org/gabrielelana/mongoose-eventful)

# Install
`npm install mongoose-eventful`

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
  with a nested field
    ✓ emits changed event when the field is changed
    ✓ emits changed:<FieldName>.<FieldName> when the field is changed
  with a virtual field
    when emitChangedOnVirtualFields option is a list of virtual field paths
      ✓ emits changed:<VirtualFieldName> when the virtual field is changed
      ✓ emits changed:<VirtualFieldName> when dependent field is changed directly
      ✓ doesn't emit changed:<VirtualFieldName> if the virtual field is not changed
      ✓ doen't emit changed:<VirtualFieldName> if nothing changed
      ✓ doen't emit changed:<VirtualFieldName> if nothing changed after creation
```

# TODO
* emits changed for array fields
  * emit `changed:fieldName`
* emits changed for fields in arrays of nested documents
  * emit `changed:fieldName`
    * give all document, nested document changed, index of nested document
  * emit `changed:fieldName.nestedFieldName`
    * give nested document changed, index of nested document, all document
  * emit `changed:fieldName.N.nestedFieldName`
    * give nested document changed, index of nested document, all document
  * what about added nested documents?
  * what about removed nested documents?
* emits changed on virtual fields
  * detects changes on non primitive values of virtual field
  * `emitChangedOnVirtualFields` set to true means "for all virtual fields"
  * `emitChangedOnVirtualFields` set to `{virtualFieldPath: listOfFieldsItDependsOn}`
