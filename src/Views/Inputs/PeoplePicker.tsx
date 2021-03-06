import * as React from 'react';
import { LabelInput } from '../../Components/Inputs/LabelInput';
import { CardModel } from '../../Models/Cards/Card';
import { PeoplePickerModel } from '../../Models/Inputs/PeoplePicker';
import { StyleManager } from '../../Styles/StyleManager';
import { NumberUtils } from '../../Utils/NumberUtils';
import { ContentFactory } from '../Factories/ContentFactory';
import { DebugOutputFactory } from '../Factories/DebugOutputFactory';

interface IProps {
    index: number;
    model: PeoplePickerModel;
    theme: 'default' | 'emphasis';
}

interface IState {
    value: string;
    selected: Array<{ Name: string, Address: string }>;
    inputFocused: boolean;
    suggestionCard: CardModel;
}

export class PeoplePickerView extends React.Component<IProps, IState> {
    private mounted: boolean;

    constructor(props: IProps) {
        super(props);

        const { model } = this.props;

        if (model && model.isValueValid) {
            model.onStoreUpdate = this.onStoreUpdate;
            model.onSuggestionReady = this.onSuggestionReady;
            model.onSelect = this.onSuggestionSelected;
            this.state = {
                value: '',
                inputFocused: false,
                selected: JSON.parse(model.selected),
                suggestionCard: undefined,
            };
        }
    }

    public componentDidMount() {
        this.mounted = true;
    }

    public componentWillUnmount() {
        this.mounted = false;
    }

    // tslint:disable-next-line:max-line-length
    public setState<K extends keyof IState>(state: ((prevState: Readonly<IState>, props: Readonly<IProps>) => (Pick<IState, K> | IState | null)) | (Pick<IState, K> | IState | null), callback?: () => void) {
        if (this.mounted) {
            super.setState(state as IState, callback);
        }
    }

    public render() {
        const { model, theme } = this.props;

        if (!model || !model.isSchemaCheckPassed) {
            return DebugOutputFactory.createDebugOutputBanner(model.type + '>>' + model.id + ' is not valid', theme, 'error');
        }

        return (
            <LabelInput
                placeholder={model.placeholder}
                value={this.state.value}
                focused={this.state.inputFocused}
                labels={this.labels}
                marginTop={this.spacing}
                suggestionView={ContentFactory.createElement(this.state.suggestionCard, 0, theme)}
                onRequestSuggestion={this.onRequestSuggestion}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onLabelRemove={this.onContactLabelRemove}
            />
        );
    }

    private onContactLabelRemove = (index: number) => {
        if (this.state.selected && NumberUtils.isInRange(index, 0, this.state.selected.length - 1)) {
            this.props.model.onRemoveContact(this.state.selected[index].Address);
        }
    }

    private onBlur = () => {
        this.setState({
            inputFocused: false
        }, () => {
            const { model } = this.props;

            if (model) {
                model.onBlur();
                let callback = model.context.blurHandler;
                if (callback) {
                    callback();
                }
            }
        });
    }

    private onFocus = () => {
        this.setState({
            inputFocused: true
        }, () => {
            const { model } = this.props;

            if (model) {
                let callback = model.context.focusHandler;
                if (callback) {
                    callback();
                }
            }
        });
    }

    private onRequestSuggestion = (input: string) => {
        this.setState({
            value: input,
        }, () => {
            const { model } = this.props;

            if (model.onInput) {
                model.onInput(this.state.value);
            }
        });
    }

    private onSuggestionSelected = () => {
        this.setState({
            suggestionCard: undefined,
        });
    }

    private onSuggestionReady = (card: CardModel) => {
        this.setState({
            suggestionCard: card,
        });
    }

    private onStoreUpdate = (value: string) => {
        this.setState({
            selected: JSON.parse(value),
            value: '',
        });
    }

    private get labels() {
        return this.state.selected.map((contact) => {
            return {
                title: contact.Name
            };
        });
    }

    private get spacing() {
        if (this.props.model.separator) {
            return 0;
        }

        if (this.props.index !== undefined && this.props.index > 0) {
            return StyleManager.getSpacing(this.props.model.spacing);
        }
        return 0;
    }
}
