const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

var qna = require('@tensorflow-models/qna');
const tf = require('@tensorflow/tfjs');
var netModel;
var _model;

class Scratch3ML4KQnaBlocks{
    constructor(runtime){
        this._qnamodel = null;


        netModel = new Promise(function (resolve) {

            qna.load()
            .catch(function (err) {
                console.log('my error '+err);
            })
            .then(function (model) {
              _model = model;
              console.log(_model+ ' _qnamodel');
              resolve('Done');
              return 'Done';
              })
            }).catch(function (err) {
              console.log('mylog'+err) ;
          
            });

    }

    getInfo() {
        return {
          id: 'mlforkidsQNA',
          name: 'Question Answering',
          menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABuwAAAbsBOuzj4gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAlHSURBVHic3Zt7sJVVFcB/697LvcgVUkEeyvsRaCrQIML1QWiJKVJqgw1ikpUONiIO9piaGHtLQ2qjyTSYaWqK1djLxEwhGkAFSixEJB8Uby4I8hAI7uqPtbbfx+d37j3nO+c7OO2ZPfuctfd67LX3XnvtvdcnqkreSUQGAU3A2cBpQD1QC9R5Dr83AsuBFV6uUdWWXGXLQwEiMgSYgHW6CTgxpdlhYDvW8RMKkNoD/B14DrhXVV+tuKyVVICIjAVmABcD4uB1wPOelwObgGZgpzpzEWkATkrkocClQBeno8ATwB2q+mzFhFbVsjI2gpOwaaueVwI3Az3KpF0LnAfcDryeoD8FaChb/jIFnAz824U6APwYGF6uUK3wGwY8CrQ4z83A56uuAOBY4AEX4jDwINA3r46n8B8J/CU2I+YDvaqiAGA4sMYZLwaGVqvjKbJMAF52WXYB1+SqAOAmn+otwPeAuqPV+ZhMtcCdsdkwCzfuxeSidgERqQV+AUwEtgJXq+qf2kRMpzUIGAuMBo5xsAKvAguBpaq6PwPd64G7MaP8CDBFVQ+2iViklu9xIdcBAzKMUjtse1xPNFKF8n7goYx8zgd2OJ1ngfZlLwHga07wdTIYOmAc8IrTOAT8Ffgm5is0AacDl2Bb3UtEFv4gMAc4vkR+g4C1TuNXtLEc2iJ2jRN6jRKtLLY2H46N7HLgw0XgdcVszT7HWw30K5F3f8zLVGB2JgUAF/oo7AFOyzDy97kAezCnqLZE/FMwh0eBLcDIEvHPB/7r+NeVpABgALDbkSdm6PwPHPefQO9W2jUCDYWmqdf9KKaEbiXKcaPj7gUGlqKAx4qZPgVww7I5AJyRUj8M+ElsnYb1/iTm3tan4ISlNL+tNZ2CO9dxF6XhpiGMdoQ1acK0wazW7YUCt6SM9hzMcwwd34gZvkMx2IrkaGEHoq1eP7VEmeqJnKUbi1HAYm88LsPoT3bcBUBNYio/43Vv+9TsGavvAFyAHX1Dm6YE7U+Hgckg1ycdt5nE1phseIU3fDwDEwFWYdtY/0TdQ073OaBPKzTaEdmPDUDXRP18rxuTQb4ljjslVQHOfK1P0SxOyFBnsCQBP92VsotWDGIC53GnNTcBn+bwBzLId15YYoUUMDXr6Dv+RMf/cgL+c4ffUAKtEzGPbh9wQgx+rtNamVHGPzj+6DQFhLX/kYzEv+H44xPwYO27l0gvzIILYrCOYTZllPFMp/lwgNUAiEgPzPqvVNWFZEuDvdwYACJSD/QDNqjq5hLprfCyPgBUdTe2y3QSkeNLFVBVlwFvAp8SkW6AKQC4DDNij5RKNJYavTwuBmvCtsYV723eZgoKq0/At3jZIQNNgN86zesgUsDlXj6ZkSjYpSfATBHpJyL9gFsdtjQDvQFeJhUwELMNG8mWfuPlxADojPnM67Osq9j6aiRa74eJHJ61QGMGesswbzLuL3R0mi+WIWct5g/sB2prsLVfBzyVUaMAqOpe4CzM23vD8xzgLK8rOonIx4ERwP2quj5WFezMmjLkPIztBg1A3zrMSIF5YWUlVd0B3FAODREZCPwMc49vS1Rf7eXzlJeWYWeWwTVAXwdm1mqlkohMwNzobsA9qvpGrK4b8AVgJ3Bvmaw2eTm4hmgGVPzZqdgkIkNF5GnMQvfEruCmJ5rNwO4Q71bVt8tkGQzoEIC/YQahpGNmJTJmOO8jMpgvARentBsLvINdrnSpAN8+zm8h2NVR81HofAPwNNGx+FpiJ8hYu5HY5UwLGe79C/Cud76bwHzuzUdBAb8mOiF2KtBmFNHd3rQK828GtoG97W2ocufHe6deJuXWF3sdvp/ohnhmDjI0Y8d3VgHrqqyAF71jlyTgAtzia12xd4SrcuAflsBCfArurWLnB5DizQGdgN953TvAt8jgQRYpQ2/n81ida7uDiHRV1a3kn871clECPhULiFgKTFLVN3OUoYeXW2swIwO2NVQjneRl0vEKh5Orcu48RArYVgO84H/65sw0pFovtyfgJwMHNOb95ZiOmAGL/c/oKjCGSAE1rbbKNw33clMNkSd4UZWY13l5VBQgIoLZmgPAghq1N/RlwCki0rsaMniZVEAddi+RdxoFdAfmq+quIERYBuOqIMAqL3cEgIiMwS5mFlSB/ye8fBQg7IvD8ZifKvkCQ7zsBcwmcncnV4H3auyxtFH1yGvxP7sQI6roFIXYnhbs/jDXEyn25K7AvHdhscqLvPLBKirgOGz/P7VK/MIT3WUBdkSQlIj8A/gg9n5X6j3++zqJyHDsen43FmewH95riWdjB4XkXdz/Q5qF7UBzNR6Flpgi7bBX2cxPZO/HDHzM+7QV+MARdSmNr/fGr1CBYORWhPoocBcWyTUdODYnPsHZU1JihdIQhOiq6qs5CTWN6LIj5CUUuBkqk1eIN1hO2pVbAaRe2N48JweBumOXoLuwiJImLHZQge9XmNdniCJOBqW2aQW5gRJjhIoUKiyx78RgnX1GZHr3L8BnFHbGUeDKQu3CweTdJCL9gY6qurI1k1pGCv5+PB5YsZeg5ENopiQiPbH4ggbsgWVewcYJrXXGXl7WVnrkYzwGEn0vNAn7kOoJV8KdFaDfC3tfUOzmudWI9iTy7Y54V14KcD4hHCeel5HYojLQbcLiCtRnQLs2cWLIfbBpuYcSIzIzCjsGs9DzsGCFcjt/LXbGVywGoM3OJxUQgpm+3QajEdjj5FfI0U8ooeN1ROG04UOOouOSA5EzfF02U/iVZqCPVnz/XgtceBQ7Px6LR1bgLeDSkmk4oT86kRkpTLpiX2IcJHrHu5no+KyumJOr2PEzsUeNwH8RieDMEmgxxon8h1gYKfZl2K1EUeO7gK8DHWJtLsciQdQVNI8czxA+U+Ofzb0GXFEmTX7pxD7ngHbAF7FoLHXDcgcFnqWB9sBMn4JhRFZj/v2QMoULH07+EPhXjP5O4EuVsEEQBQx1AK4kCnRqwS4Q+hZJ6Bgs7GQxR25vW7D9+CbsVWgw9q2wxHDbY4EaZ2MXJNOxx9HmBK1FwGep4JMZwO+JIrsCo6eAYWUQ/RC2xb1A9NVGMh/CjqfbC9Sr464AvksBX77cLFhc7k+Bc7AT0yxVfYYKJRFpxPzyc4BTsdj/Ls63M2Y73orlbS7HUmC5qu6rlCxp6X9uEJbrTo0AhwAAAABJRU5ErkJggg==',
          blocks: [{
            opcode: 'runQA',
            text: formatMessage({
              id: 'mlforkids.qna.getTopAnswer',
              default: 'find answer to [QUESTION] in [PASSAGE]'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
              QUESTION: {
                type: ArgumentType.STRING,
                defaultValue: 'question'
              },
              PASSAGE: {
                type: ArgumentType.STRING,
                defaultValue: 'passage'
              }
            }
          }]
        };
      }

      runQA(args) {
          
        return this._findAnswer(args.QUESTION, args.PASSAGE);
      } 



      _findAnswer(question, passage) {
      if (_model && question && passage) {
        return _model.findAnswers(question, passage).then(function (answers) {
          if (answers && answers.length > 0) {
            return answers[0].text;
          }
          return '';
        }).catch(function (err) {
          console.log('[mlforkids] Failed to find answer', err);
        });
      }
    }

}
module.exports=Scratch3ML4KQnaBlocks;