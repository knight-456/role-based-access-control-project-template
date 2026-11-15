export interface TableClassNames {
  container?: string;
  table?: string;
  thead?: string;
  th?: string;
  tbody?: string;
  tr?: string;
  td?: string;
  empty?: string;
  pagination?: {
    container?: string;
    info?: string;
    buttons?: string;
    pageText?: string;
  };
}

export interface MasterDataTableClassNames {
  root?: string;
  header?: {
    container?: string;
    title?: string;
    description?: string;
    addButton?: string;
  };
  search?: {
    container?: string;
    input?: string;
  };
  table?: TableClassNames;
  modal?: {
    backdrop?: string;
    container?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
}

export interface RoleListTableClassNames {
  root?: string;
  header?: {
    container?: string;
    title?: string;
    description?: string;
    createButton?: string;
  };
  search?: {
    container?: string;
    input?: string;
  };
  table?: TableClassNames;
}
