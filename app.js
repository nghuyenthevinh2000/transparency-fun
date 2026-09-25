import { reports, futureSlots } from './interactive/index.js';

const grid = document.getElementById('report-grid');
const featured = reports.find((report) => report.featured) ?? reports[0];

if (featured) {
  const feature = document.getElementById('featured-report');
  feature.href = featured.href;
  feature.setAttribute('aria-label', `Open ${featured.title} report`);
  document.getElementById('featured-index').textContent = `REPORT ${featured.number}`;
  document.getElementById('featured-title').textContent = featured.title;
  document.getElementById('featured-description').textContent = featured.description;
  if (featured.cover?.src) {
    const image = document.getElementById('featured-cover');
    image.alt = featured.cover.alt || '';
    image.hidden = false;
    image.parentElement.classList.add('has-image');
    image.addEventListener('error', () => {
      image.hidden = true;
      image.parentElement.classList.remove('has-image');
    }, { once: true });
    image.src = featured.cover.src;
  }
} else {
  document.getElementById('featured-report').hidden = true;
}

function card({ number, category, title, description, href, cover: coverImage }) {
  const published = Boolean(href);
  const element = document.createElement(published ? 'a' : 'article');
  element.className = `report-card${published ? '' : ' is-future'}`;
  if (published) {
    element.href = href;
    element.setAttribute('aria-label', `Open ${title} report`);
  }
  const cover = document.createElement('div');
  cover.className = `card-cover ${published ? 'active' : 'future'}`;
  const numberLine = document.createElement('div');
  numberLine.className = 'report-number';
  const index = document.createElement('span');
  index.textContent = number;
  const type = document.createElement('span');
  type.textContent = published ? category : 'COMING SOON';
  numberLine.append(index, type);
  const art = document.createElement('div');
  art.className = published ? (coverImage?.src ? 'card-art' : 'card-art report-art') : 'card-art future-art';
  art.setAttribute('aria-hidden', 'true');
  if (published && coverImage?.src) {
    const image = document.createElement('img');
    image.alt = coverImage.alt || '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.remove();
      art.classList.add('report-art');
    }, { once: true });
    image.src = coverImage.src;
    art.append(image);
  } else if (!published) {
    art.textContent = '✳';
  }
  const coverBottom = document.createElement('span');
  coverBottom.className = 'cover-bottom';
  coverBottom.textContent = published ? 'FOLLOW THE FLOW →' : 'A SPACE FOR WHAT’S NEXT';
  cover.append(numberLine, art, coverBottom);
  const info = document.createElement('div');
  info.className = 'card-info';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const summary = document.createElement('p');
  summary.textContent = description;
  const action = document.createElement('span');
  action.className = 'card-open';
  action.textContent = published ? 'Open report ↗' : 'Coming soon';
  info.append(heading, summary, action);
  element.append(cover, info);
  return element;
}

const entries = [
  ...reports,
  ...futureSlots.filter((slot) => !reports.some((report) => report.number === slot.number)),
].sort((a, b) => Number(a.number) - Number(b.number));
grid.replaceChildren(...entries.map(card));
