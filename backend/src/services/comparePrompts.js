export function calculateMatchScore(promptA, promptB) {
    let score = 0;
  
    if (promptA.type === promptB.type) score += 25;
    if (promptA.brand === promptB.brand) score += 20;
    if (promptA.color === promptB.color) score += 10;
  
    const commonFeatures = promptA.features.filter(f => promptB.features.includes(f)).length;
    const commonDetails = promptA.details.filter(d => promptB.details.includes(d)).length;
  
    score += commonFeatures * 10;
    score += commonDetails * 5;
  
    return Math.min(score, 100); // cap at 100%
  }