export type Id = string | number;

export type Task = {
  id: Id;
  columnId: Id;
  title: string;
  type: string;
  status?: string;
};

export type Column = {
  id: Id;
  title: string;
};
