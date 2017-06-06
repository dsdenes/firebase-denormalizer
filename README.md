Install
-------
```bash
$ npm install firebase-denormalizer
```

Usage
-----
```javascript
import firebase from 'firebase';
firebase.initializeApp(<your config>);

import FirebaseDenormalizer from './index';
const modelDenormalizer = FirebaseDenormalizer(firebase.database());
const dogs = modelDenormalizer('dogs');

dogs.filterableProperty('type');
dogs.filterableProperty('kennel');

(async () => {
  await dogs.push({
    name: 'Lolly',
    type: 'wolfdog',
    kennel: 'John Doe Kennel'
  });

  /*
   * Automatically creates and housekeeps you these denormalized collections:
   *
   * dogs: {
   *   -KlzBG8yTrXZ5SG37mIa: {
   *     name: 'Lolly',
   *     type: 'wolfdog',
   *     kennel: 'John Doe Kennel'
   *   }
   * }
   *
   * dogTypes: {
   *   'wolfdog': {
   *     -KlzBG8yTrXZ5SG37mIa: true
   *   }
   * }
   *
   * dogKennels: {
   *   'johnDoeKennel': {
   *     -KlzBG8yTrXZ5SG37mIa: true
   *   }
   * }
   */


  /*
   * And from now, you can filter on multiple properties
   */
  await dogs.find({
    type: 'wolfdog',
    kennel: 'John Doe Kennel',
    name: 'Lolly'
  });

})();
```