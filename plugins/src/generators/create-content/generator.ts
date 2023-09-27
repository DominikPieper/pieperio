import {
  Tree,
  logger,
  normalizePath
} from '@nx/devkit';
import { CreateContentGeneratorSchema } from './schema';
import { copyFileSync } from 'fs';

export async function createContentGenerator(tree: Tree, options: CreateContentGeneratorSchema) {
  if (!tree.exists('vault')) {
    logger.error('Vault not found');
    return;
  }
  const notesDirInVault = 'vault/Efforts/Notes/SiteNotes/3. Published/';
  const notesContentDir = 'src/content/notes/';

  const blogDirInVault = 'vault/Efforts/Notes/Blog/3. Published/';
  const blogContentDir = 'src/content/blog/';

  const rmark = new RMark();
  tree.children(notesDirInVault).forEach(noteName => {
    const content = tree.read(normalizePath(`${notesDirInVault}/${noteName}`), 'utf-8');
    if (content != null) {
      tree.write(normalizePath(`${notesContentDir}/${noteName}`), rmark.render(content));
    }
  });

  tree.children(blogDirInVault).forEach(articleName => {
    const content = tree.read(normalizePath(`${blogDirInVault}/${articleName}`), 'utf-8');
    if (content != null) {
      tree.write(normalizePath(`${blogContentDir}/${articleName}`), rmark.render(content));
    }
  });

  const vaultAssetsDir = 'vault/Atlas/Utilities/Images/';
  //const blogAssetsDir = 'src/assets/';
  const blogAssetsDir = 'public/';
  rmark.getAllUrls().forEach(fileName => {
    copyFileSync(vaultAssetsDir + fileName, blogAssetsDir + fileName);
  })
}

export class Pattern {
  public urls: string[] = [];  // Storage for URLs

  constructor(public regex: RegExp, public replacement: string) { }

  apply(raw: string): string {
    let match;
    while ((match = this.regex.exec(raw)) !== null) {
      if (match[1]) {  // Assuming URLs are in matching group 1
        this.urls.push(match[1]);
      }
    }
    return raw.replace(this.regex, this.replacement);
  }
}

export class Rule {
  name: string;
  patterns: Pattern[];
  public urls: string[] = [];  // Storage for URLs

  constructor(name: string, patterns: Pattern[]) {
    this.name = name;
    this.patterns = patterns;
  }

  apply(raw: string): string {
    this.patterns.forEach(pattern => {
      raw = pattern.apply(raw);
      this.urls.push(...pattern.urls);  // Collect URLs from each pattern
    });
    return raw;
  }
}

export class RMark {
  private urlSet: Set<string> = new Set();  // Use a Set to store URLs

  private rules: Rule[] = [
    new Rule('image', [
      new Pattern(/!\[([^\]]+)\]\((\S+)\)/g, '![$2](/$1)'),
      new Pattern(/!\[\[([^\]]+)\]\]/g, '![Image](/$1)')
    ]),
  ];

  public addRuleBefore(rule: Rule, before: string): RMark {
    const index = this.rules.findIndex((r) => r.name === before);
    if (index !== -1) {
      this.rules.splice(index, 0, rule);
    }
    return this;
  }

  public addRule(rule: Rule): RMark {
    this.addRuleBefore(rule, 'paragraph');
    return this;
  }

  public render(raw: string): string {
    this.rules.forEach((rule) => {
      raw = rule.apply(raw);
      rule.urls.forEach(url => this.urlSet.add(url));  // Add URLs to the Set
    });
    return raw;
  }

  public getAllUrls(): string[] {
    return Array.from(this.urlSet);  // Convert the Set to an array
  }
}

export default createContentGenerator;
