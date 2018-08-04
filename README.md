# trex-on-flow

You can find the guide here: https://medium.com/@jseijas/introduction-to-artificial-intelligence-with-dinosaurs-fbda58aae727

## Installation

Just clone the repo, and then run:

```sh
npm install
npm start
```

Navigate to http://localhost:3000 to see your code running

## Solving the code

At /src/apps you'll find the base code for Random, Genetic and Neural Network apps.
If you need to see how to solve it, you can find the solutions at the branch "solved" https://github.com/jseijas/trex-on-flow/tree/solved/src/apps

## Changing the method or difficulty level

You can do it at the index.html file:
```javascript
<script>
    global.appType = 'Genetic';
    global.level = 'hard';
</script>
```

Valid values for global.appType are *Random*, *Genetic* and *NeuralNetwork*.
Valid values for global.level are *easy*, *medium* and *hard*.
