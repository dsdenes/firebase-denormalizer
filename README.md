[![CircleCI](https://circleci.com/gh/dsdenes/firebase-denormalizer/tree/master.svg?style=svg)](https://circleci.com/gh/dsdenes/firebase-denormalizer/tree/master)
## Install
```bash
$ npm install firebase-denormalizer
```

## Usage
```javascript
import firebase from 'firebase';
firebase.initializeApp(<your config>);

import FirebaseDenormalizer from 'firebase-denormalizer';
const modelDenormalizer = FirebaseDenormalizer(firebase.database());
const dogs = modelDenormalizer('Dogs');

dogs.filterableProperty('type');
dogs.filterableProperty('kennel');

(async () => {
  await dogs.push({
    name: 'Lolly',
    type: 'wolfdog',
    Kennel: 'John Doe Kennel'
  });

  /*
   * Automatically creates and housekeeps you these denormalized collections:
   *
   * Dogs: {
   *   -KlzBG8yTrXZ5SG37mIa: {
   *     name: 'Lolly',
   *     type: 'wolfdog',
   *     Kennel: 'John Doe Kennel'
   *   }
   * }
   *
   * Dog-types: {
   *   'wolfdog': {
   *     -KlzBG8yTrXZ5SG37mIa: true
   *   }
   * }
   *
   * Dog-Kennels: {
   *   'johnDoeKennel': {
   *     -KlzBG8yTrXZ5SG37mIa: true
   *   }
   * }
   */


  /*
   * And from now, you can filter on multiple properties
   */
  await dogs.findValue({
    type: 'wolfdog',
    Kennel: 'John Doe Kennel',
    name: 'Lolly'
  });

})();
```

## API
### .findValue(\<filter\>) => Promise => collections
### .find(\<filter\>) => Result EventEmitter

#### Result EventEmitter
.on('value', collections)
