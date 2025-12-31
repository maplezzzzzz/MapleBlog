// content reading
const readingTime = (content: string, complexity: number): string => {
  if (!content) {
    return "0分钟";
  }
  // 中文阅读速度：每分钟约300-400字，取350字/分钟
  const CPS = 350 / 60; // Characters Per Second

  let images = 0;
  // 匹配中文字符、英文字母、数字
  const chineseRegex = /[\u4e00-\u9fa5]/g;
  const englishRegex = /[a-zA-Z0-9]/g;

  // 统计图片数量
  const imageRegex = /\.(png|jpg|jpeg|svg|webp|gif)/gi;
  const imageMatches = content.match(imageRegex);
  images = imageMatches ? imageMatches.length : 0;

  // 统计中文字符数
  const chineseChars = content.match(chineseRegex);
  const chineseCount = chineseChars ? chineseChars.length : 0;

  // 统计英文字符数（按单词计算，除以5作为平均单词长度）
  const englishChars = content.match(englishRegex);
  const englishWordCount = englishChars
    ? Math.ceil(englishChars.length / 5)
    : 0;

  // 总字数（中文字符 + 英文单词数）
  const totalChars = chineseCount + englishWordCount;

  let imageSecs = 0;
  let imageFactor = 12;

  while (images) {
    imageSecs += imageFactor;
    if (imageFactor > 3) {
      imageFactor -= 1;
    }
    images -= 1;
  }

  let ttr = 0; // time to read (in minutes)
  ttr = totalChars / CPS;
  ttr = ttr + imageSecs;
  ttr = ttr * complexity;
  ttr = Math.ceil(ttr / 60);

  // 确保最少显示1分钟
  if (ttr < 1) {
    ttr = 1;
  }

  return ttr + `分钟`;
};

export default readingTime;
