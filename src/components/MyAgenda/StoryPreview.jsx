import PropTypes from 'prop-types';
import BrandLogo from '../BrandLogo';
import { formatDate, formatTime } from '../../utils/dateUtils';

const StoryPreview = ({ selectedBlocks, date, forwardRef }) => {
    if (!selectedBlocks || selectedBlocks.length === 0) return null;

    return (
        <div
            ref={forwardRef}
            className="w-[1080px] h-[1920px] bg-background text-foreground flex flex-col p-24 relative overflow-hidden"
            style={{
                fontFamily: "'Bricolage Grotesque', sans-serif"
            }}
        >
            {/* Background Pattern: Subtle dots that adapt to theme */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Background Accents: Vibrant and aesthetically pleasing */}
            <div className="absolute top-[-300px] left-[-300px] w-[900px] h-[900px] bg-primary/20 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-100px] right-[-300px] w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[120px]" />

            {/* Header: Logo and Date */}
            <div className="mt-12 flex flex-col items-center space-y-12 z-10">
                <BrandLogo className="h-32 w-auto text-foreground" />
                <div className="text-center space-y-4">
                    <p className="text-4xl font-black uppercase tracking-[0.4em] opacity-40">Minha Agenda</p>
                    <h1 className="text-7xl font-black uppercase tracking-tight text-primary leading-none">
                        {formatDate(date)}
                    </h1>
                </div>
            </div>

            {/* Blocks List: Balanced for 4 items */}
            <div className="flex-1 flex flex-col justify-center space-y-12 z-10 mx-6">
                {selectedBlocks.map((block) => (
                    <div key={block.id} className="flex flex-col space-y-2">
                        <div className="flex items-center gap-6">
                            <span className="text-6xl font-black text-primary tabular-nums leading-none">
                                {formatTime(block.horario)}
                            </span>
                            <div className="h-1 flex-1 bg-foreground/10 self-center" />
                        </div>
                        <h3 className="text-6xl font-black tracking-tighter leading-[1.1] uppercase">
                            {block.nome}
                        </h3>
                        <p className="text-3xl font-bold opacity-40 uppercase tracking-wide line-clamp-1">
                            {block.endereco || 'Endereço não informado'}
                        </p>
                    </div>
                ))}
            </div>

            {/* Footer: Web URL */}
            <div className="mb-12 flex justify-center z-10">
                <p className="text-4xl font-black uppercase tracking-[0.5em] opacity-30">
                    tateno-app.web.app
                </p>
            </div>
        </div>
    );
};

StoryPreview.propTypes = {
    selectedBlocks: PropTypes.array.isRequired,
    date: PropTypes.string.isRequired,
    forwardRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ])
};

export default StoryPreview;
