import * as Diff from 'diff';
const MIN_LENGTH = 5
export default {
    name: 'u-diff',
    props: {
      original: String,
      target: String,
    },
    data() {
        return {
            splitFlag: false,
            diffArray: [],
            seperateList: {
              leftPart: [],
              rightPart: [],
            },
        }
    },
    computed: {
      data() {
        return this.splitFlag ? [ this.seperateList.leftPart, this.seperateList.rightPart ] : [this.diffArray];
      }
    },
    watch: {
      original(val) {
        this.handleData();
      }
    },
    created() {
      this.handleData();
    },
    methods: {
        handleData() {
            const diffArray = Diff.diffJson(this.original, this.target);
            console.log(diffArray)
            if (typeof diffArray === 'string') return
            let lStartNum = 1, rStartNum = 1;
            this.diffArray = diffArray.map(item => {
                let { added, removed, value, count } = item;
                const strArr = value ? value.split('\n').filter(item => item) : [];
                const type = (added && '+') || (removed && '-') || '';
                let head, hidden, tail
                const len = strArr.length;
                if (!type || len <= MIN_LENGTH * 2) {
                    hidden = []
                    tail = []
                    head = strArr
                } else {
                    head = strArr.slice(0, MIN_LENGTH)
                    hidden = strArr.slice(MIN_LENGTH, len - MIN_LENGTH)
                    tail = strArr.slice(len - MIN_LENGTH)
                }
                let leftPos = lStartNum, rightPos = rStartNum
                lStartNum += type === '+' ? 0 : count;
                rStartNum += type === '-' ? 0 : count;
                return {
                    type, count, content: { hidden, head, tail }, leftPos, rightPos
                }
            })
        },
        getLineNum(number) {
            return ('    ' + number).slice(-4);
        },
        colorCode(item, isHead = true) {
            const { type, content: { head, tail, hidden }, leftPos, rightPos } = item
            const isSame = !type //没有变化的部分
            const space = "    ";
            return (isHead ? head : tail).map((citem, cindex) => {
                let posMark = '';
                if (this.splitFlag) {
                  if (isSame) {
                    const shift = isHead ? 0: (head.length + hidden.length);
                    posMark = (space + (leftPos + shift + cindex)).slice(-4)
                  } else {
                    posMark = type === '-' ? this.getLineNum(leftPos + cindex) : this.getLineNum(rightPos + cindex);
                  }
                } else {
                  if (isSame) {
                    const shift = isHead ? 0: (head.length + hidden.length);
                    posMark = (space + (leftPos + shift + cindex)).slice(-4) + (space + (rightPos + shift + cindex)).slice(-4);
                  } else {
                      posMark = type === '-' ? this.getLineNum(leftPos + cindex) + space : space + this.getLineNum(rightPos + cindex);
                  }
                }
                return { text: citem, posMark }
            })
        },
        classMap(type) {
            const map = {
                '+': 'add',
                '-': 'remove'
            }
            return map[type] || ''
        },
        expand(rowIndex) {
            for(let diff of this.data) {
              let target = diff[rowIndex]
              const { type, content: { head, tail, hidden } } = target;
              if (type === 'head') {
                  target.content.head = head.concat(hidden.slice(0, MIN_LENGTH))
                  target.content.hidden = hidden.slice(MIN_LENGTH)
              } else if (type === 'tail') {
                  const length = hidden.length
                  target.content.tail = hidden.slice(length - MIN_LENGTH).concat(tail)
                  target.content.hidden = hidden.slice(0, length - MIN_LENGTH)
              } else {
                  target.content.head = head.concat(hidden)
                  target.content.hidden = []
              }
              diff.splice(rowIndex, 1, target)
            }
        },
        getSplitContent() {
          this.splitFlag = true
          this.seperateList = {
            leftPart: this.diffArray.filter(line => line.type !== '+'),
            rightPart: this.diffArray.filter(line => line.type !== '-')
          }
        }
    },
};
