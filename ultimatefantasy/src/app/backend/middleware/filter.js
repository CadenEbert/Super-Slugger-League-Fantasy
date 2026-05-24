import { RegExpMatcher, englishDataset, americanBritishWords } from 'bad-words';

const matcher = new RegExpMatcher({
  ...englishDataset,
  ...americanBritishWords,
});

function checkProfanity(req, res, next) {
  const bodyText = JSON.stringify(req.body);

  if (matcher.hasMatch(bodyText)) {
    return res.status(400).json({ 
      error: 'Submission rejected: Inappropriate content detected.' 
    });
  }

  next();
}

export default checkProfanity;